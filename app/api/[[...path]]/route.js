import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import OpenAI from 'openai'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'

// -------- Mongo singleton --------
let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL)
    await cachedClient.connect()
  }
  return cachedClient.db(process.env.DB_NAME || 'beyond_marketing')
}

// -------- LLM client (Emergent OpenAI-compatible) --------
const llm = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://integrations.emergentagent.com/llm/openai/v1',
})

const JWT_SECRET = process.env.JWT_SECRET || 'beyond-marketing-dev-secret-key'
const SEARCHATLAS_KEY = process.env.SEARCHATLAS_API_KEY

// SearchAtlas API helper (accepts optional per-user key)
async function saFetch(url, opts = {}, key = null) {
  const useKey = key || SEARCHATLAS_KEY
  const r = await fetch(url, {
    ...opts,
    headers: { 'X-API-Key': useKey, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const text = await r.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  return { status: r.status, ok: r.ok, body }
}

// Resolve the SA key for a given user (their stored key, else the env fallback)
async function getUserSaKey(userId) {
  try {
    const db = await getDb()
    const u = await db.collection('users').findOne({ id: userId })
    return u?.searchAtlasApiKey || SEARCHATLAS_KEY
  } catch { return SEARCHATLAS_KEY }
}

// For the public report endpoint: try every admin's SA key until one finds the project hash.
async function saFetchAnyAdmin(url) {
  const db = await getDb()
  const admins = await db.collection('users').find({ role: 'admin' }).toArray()
  const keys = [SEARCHATLAS_KEY, ...admins.map(a => a.searchAtlasApiKey).filter(Boolean)]
  const unique = [...new Set(keys.filter(Boolean))]
  for (const k of unique) {
    const r = await saFetch(url, {}, k)
    if (r.ok) return { ...r, keyUsed: k }
  }
  return { ok: false, status: 502, body: { error: 'No working SearchAtlas key' } }
}

// Seed admin on first module load
let adminSeeded = false
async function seedAdmin() {
  if (adminSeeded) return
  adminSeeded = true
  try {
    const db = await getDb()
    const email = (process.env.ADMIN_SEED_EMAIL || 'admin@beyond.local').toLowerCase()
    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      if (existing.role !== 'admin') {
        await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } })
      }
      return
    }
    const password = process.env.ADMIN_SEED_PASSWORD || 'BeyondAdmin2025!'
    const hash = await bcrypt.hash(password, 10)
    await db.collection('users').insertOne({
      id: uuidv4(),
      name: 'Beyond Admin',
      email,
      company: 'Beyond Marketing',
      password: hash,
      role: 'admin',
      createdAt: new Date(),
    })
    console.log(`[seed] Admin account created: ${email}`)
  } catch (e) { console.error('Admin seed failed:', e?.message || e); adminSeeded = false }
}

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

function getToken(req) {
  const auth = req.headers.get('authorization') || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

async function handler(request, ctx) {
  await seedAdmin()
  const params = await ctx.params
  const segments = params?.path || []
  const path = '/' + segments.join('/')
  const method = request.method

  try {
    if (path === '/' || path === '/health') {
      return json({ ok: true, service: 'beyond-marketing-api', ts: new Date().toISOString() })
    }

    // ===== AUTH =====
    if (path === '/auth/register' && method === 'POST') {
      const { name, email, password, company } = await request.json()
      if (!email || !password || !name) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existing) return json({ error: 'Email already registered' }, 409)
      const hash = await bcrypt.hash(password, 10)
      const user = {
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        company: company || '',
        password: hash,
        role: 'client',
        createdAt: new Date(),
      }
      await db.collection('users').insertOne(user)
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' })
      return json({ token, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } })
    }

    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const user = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (!user) return json({ error: 'Invalid credentials' }, 401)
      const ok = await bcrypt.compare(password, user.password)
      if (!ok) return json({ error: 'Invalid credentials' }, 401)
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' })
      return json({ token, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } })
    }

    if (path === '/auth/me' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      const user = await db.collection('users').findOne({ id: decoded.id })
      if (!user) return json({ error: 'Not found' }, 404)
      return json({ user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } })
    }

    // ===== AI Marketing Audit =====
    if (path === '/audit' && method === 'POST') {
      const body = await request.json()
      const { name, email, website, industry, goals, currentChallenges } = body
      if (!email || !website) return json({ error: 'Website and email required' }, 400)

      const db = await getDb()
      const auditId = uuidv4()
      await db.collection('audits').insertOne({
        id: auditId,
        name: name || '',
        email: email.toLowerCase(),
        website,
        industry: industry || '',
        goals: goals || '',
        currentChallenges: currentChallenges || '',
        status: 'generating',
        createdAt: new Date(),
      })

      const systemPrompt = `You are a senior growth strategist at Beyond Marketing, a modern agency that connects marketing, sales, technology, automation, and reporting into ONE simplified ecosystem. You believe marketing shouldn't be complicated, businesses should own their data, and every part of a business should be connected.

Produce a concise, actionable Marketing Audit reflecting our Plan -> Build -> Grow framework.

Return STRICT JSON with this exact shape:
{
  "healthScore": <number 0-100>,
  "positioning": "<one sentence positioning statement>",
  "topInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "plan":  {"summary": "<2-3 sentences>", "actions": ["a1","a2","a3","a4"]},
  "build": {"summary": "<2-3 sentences>", "actions": ["a1","a2","a3","a4"]},
  "grow":  {"summary": "<2-3 sentences>", "actions": ["a1","a2","a3","a4"]},
  "connectedSystems": ["<system 1>","<system 2>","<system 3>","<system 4>"],
  "quickWins": ["<qw 1>","<qw 2>","<qw 3>"],
  "estimatedImpact": "<one line>"
}
Be sharp and specific. No markdown. Only JSON.`

      const userPrompt = `Business/Website: ${website}
Industry: ${industry || 'Unknown'}
Stated Goals: ${goals || 'Not specified'}
Current Challenges: ${currentChallenges || 'Not specified'}
Contact: ${name || 'Prospect'} <${email}>

Produce the audit JSON now.`

      let audit
      const tryModel = async (model) => {
        const completion = await llm.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        })
        return JSON.parse(completion.choices[0].message.content)
      }

      try {
        audit = await tryModel('gpt-5')
      } catch (e1) {
        console.error('gpt-5 err:', e1?.message || e1)
        try {
          audit = await tryModel('gpt-4o')
        } catch (e2) {
          console.error('gpt-4o err:', e2?.message || e2)
          await db.collection('audits').updateOne({ id: auditId }, { $set: { status: 'error' } })
          return json({ error: 'AI service unavailable. Please try again shortly.' }, 502)
        }
      }

      await db.collection('audits').updateOne(
        { id: auditId },
        { $set: { status: 'ready', audit, completedAt: new Date() } }
      )
      return json({ id: auditId, audit })
    }

    if (path.startsWith('/audit/') && method === 'GET') {
      const id = path.split('/')[2]
      const db = await getDb()
      const doc = await db.collection('audits').findOne({ id })
      if (!doc) return json({ error: 'Not found' }, 404)
      return json({ id: doc.id, status: doc.status, audit: doc.audit })
    }

    // ===== Contact =====
    if (path === '/contact' && method === 'POST') {
      const body = await request.json()
      const doc = { id: uuidv4(), ...body, createdAt: new Date() }
      const db = await getDb()
      await db.collection('contacts').insertOne(doc)
      return json({ ok: true, id: doc.id })
    }

    // ===== Portal Dashboard =====
    if (path === '/portal/dashboard' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      const user = await db.collection('users').findOne({ id: decoded.id })

      const realProjects = await db.collection('projects').find({ userId: decoded.id }).sort({ createdAt: -1 }).toArray()
      const realTasks = await db.collection('tasks').find({ userId: decoded.id }).sort({ createdAt: -1 }).toArray()

      const traffic = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
        organic: 800 + i * 180 + Math.round(Math.sin(i) * 120),
        paid: 250 + i * 45 + Math.round(Math.cos(i) * 60),
        direct: 380 + i * 55 + Math.round(Math.sin(i / 2) * 80),
      }))

      const rankings = [
        { keyword: 'marketing agency', position: 4, change: +2 },
        { keyword: 'connected business systems', position: 1, change: +5 },
        { keyword: 'seo services', position: 7, change: -1 },
        { keyword: 'crm setup consultant', position: 3, change: +1 },
        { keyword: 'business growth strategy', position: 6, change: +3 },
      ]

      // Try to pull real SearchAtlas project data using this user's key (if admin) or env fallback
      let searchAtlas = null
      let otto = null
      try {
        const userKey = user?.searchAtlasApiKey || SEARCHATLAS_KEY
        const sa = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/', {}, userKey)
        if (sa.ok && sa.body.results?.length) {
          const linkedId = user?.searchAtlasProjectId
          const p = (linkedId && sa.body.results.find(x => x.id === linkedId)) || sa.body.results[0]
          searchAtlas = {
            hostname: p.hostname,
            projectId: p.id,
            linked: !!(linkedId && linkedId === p.id),
            trackedKeywords: p.tracked_keywords_count,
            avgPosition: p.position_legends?.current_avg_position,
            positionDelta: p.position_legends?.position_delta,
            searchVisibility: p.search_visibility_report?.[0]?.sv,
            serpsOverview: p.serps_overview?.[0] || null,
            keywordsUpDown: p.keywords_up_down_report,
            estimatedTraffic: p.estimated_traffic_report,
            publicShareHash: p.public_share_hash,
          }

          // Try to also find OTTO data for this hostname (with & without www.)
          try {
            const oResp = await saFetch('https://sa.searchatlas.com/api/v2/otto-projects/', {}, userKey)
            if (oResp.ok && oResp.body.results?.length) {
              const host = (p.hostname || '').replace(/^www\./, '').toLowerCase()
              const match = oResp.body.results.find(o => {
                const oh = (o.hostname || '').replace(/^www\./, '').toLowerCase()
                return oh === host || oh.includes(host) || host.includes(oh)
              })
              if (match) {
                otto = {
                  uuid: match.uuid,
                  hostname: match.hostname,
                  autopilotActive: match.autopilot_is_active,
                  installStatus: match.pixel_state_display?.severity,
                  installLabel: match.pixel_state_display?.label,
                  timeSavedMinutes: match.time_saved_total,
                  aiGradeOverall: match.ai_grade_overall,
                  aiGradeBefore: match.ai_grade_overall_before,
                  aiGradeDelta: match.ai_grade_overall_delta,
                  holisticScores: match.holistic_scores,
                  holisticScoresDelta: match.holistic_scores_delta,
                  afterSummary: match.after_summary,
                  pagesWithIssues: match.pages_with_issues,
                  lastAnalysis: match.last_analysis,
                  lastDeployedAt: match.last_deploy_event_timestamp,
                  nextAnalysisAt: match.next_analysis_at,
                  cms: match.detected_cms,
                }
              }
            }
          } catch (e) { /* OTTO optional */ }
        }
      } catch (e) { /* SearchAtlas optional */ }

      const projects = realProjects.length ? realProjects.map(p => ({ id: p.id, name: p.name, progress: p.progress, phase: p.phase, status: p.status })) : [
        { name: 'SEO & Local Authority', progress: 68, phase: 'Grow', status: 'On track' },
        { name: 'HubSpot CRM Setup', progress: 92, phase: 'Build', status: 'Wrapping up' },
        { name: 'Website Redesign', progress: 41, phase: 'Build', status: 'In progress' },
        { name: 'Q3 Marketing Plan', progress: 100, phase: 'Plan', status: 'Complete' },
      ]

      const tasks = realTasks.length ? realTasks.map(t => ({ id: t.id, title: t.title, due: t.due, owner: t.owner, done: !!t.done })) : [
        { title: 'Approve brand voice guide', due: '2 days', owner: 'Client' },
        { title: 'Provide Google Ads access', due: 'Today', owner: 'Client' },
        { title: 'Review Q3 content calendar', due: '5 days', owner: 'Client' },
      ]

      const notifications = [
        { title: 'New monthly report ready', time: '2h ago', type: 'report' },
        { title: 'Keyword "connected business systems" reached #1', time: '1d ago', type: 'win' },
        { title: 'Discovery call recording uploaded', time: '3d ago', type: 'meeting' },
      ]

      return json({
        user: user ? { name: user.name, email: user.email, company: user.company, role: user.role } : null,
        healthScore: 78,
        kpis: {
          organicTraffic: { value: '18,420', delta: '+24%' },
          leads: { value: '312', delta: '+18%' },
          conversions: { value: '4.6%', delta: '+0.8pp' },
          revenueAttributed: { value: '$142,300', delta: '+31%' },
        },
        traffic,
        rankings,
        projects,
        tasks,
        notifications,
        searchAtlas,
        otto,
      })
    }

    // ===== Portal Projects CRUD =====
    if (path === '/portal/projects' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      const list = await db.collection('projects').find({ userId: decoded.id }).sort({ createdAt: -1 }).toArray()
      return json({ projects: list.map(p => ({ id: p.id, name: p.name, phase: p.phase, status: p.status, progress: p.progress, createdAt: p.createdAt })) })
    }

    if (path === '/portal/projects' && method === 'POST') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      if (!body.name) return json({ error: 'Name required' }, 400)
      const doc = {
        id: uuidv4(),
        userId: decoded.id,
        name: body.name,
        phase: body.phase || 'Plan',
        status: body.status || 'In progress',
        progress: typeof body.progress === 'number' ? body.progress : 0,
        createdAt: new Date(),
      }
      const db = await getDb()
      await db.collection('projects').insertOne(doc)
      return json({ project: { id: doc.id, name: doc.name, phase: doc.phase, status: doc.status, progress: doc.progress, createdAt: doc.createdAt } })
    }

    if (path.startsWith('/portal/projects/') && method === 'PATCH') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const body = await request.json()
      const $set = {}
      for (const k of ['name', 'phase', 'status', 'progress']) if (k in body) $set[k] = body[k]
      const db = await getDb()
      const r = await db.collection('projects').updateOne({ id, userId: decoded.id }, { $set })
      if (!r.matchedCount) return json({ error: 'Not found' }, 404)
      return json({ ok: true })
    }

    if (path.startsWith('/portal/projects/') && method === 'DELETE') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const db = await getDb()
      await db.collection('projects').deleteOne({ id, userId: decoded.id })
      return json({ ok: true })
    }

    // ===== Portal Tasks CRUD =====
    if (path === '/portal/tasks' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      const list = await db.collection('tasks').find({ userId: decoded.id }).sort({ createdAt: -1 }).toArray()
      return json({ tasks: list.map(t => ({ id: t.id, title: t.title, due: t.due, owner: t.owner, done: !!t.done, createdAt: t.createdAt })) })
    }

    if (path === '/portal/tasks' && method === 'POST') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      if (!body.title) return json({ error: 'Title required' }, 400)
      const doc = {
        id: uuidv4(),
        userId: decoded.id,
        title: body.title,
        due: body.due || 'This week',
        owner: body.owner || 'Client',
        done: false,
        createdAt: new Date(),
      }
      const db = await getDb()
      await db.collection('tasks').insertOne(doc)
      return json({ task: { id: doc.id, title: doc.title, due: doc.due, owner: doc.owner, done: false } })
    }

    if (path.startsWith('/portal/tasks/') && method === 'PATCH') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const body = await request.json()
      const $set = {}
      for (const k of ['title', 'due', 'owner', 'done']) if (k in body) $set[k] = body[k]
      const db = await getDb()
      const r = await db.collection('tasks').updateOne({ id, userId: decoded.id }, { $set })
      if (!r.matchedCount) return json({ error: 'Not found' }, 404)
      return json({ ok: true })
    }

    if (path.startsWith('/portal/tasks/') && method === 'DELETE') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const db = await getDb()
      await db.collection('tasks').deleteOne({ id, userId: decoded.id })
      return json({ ok: true })
    }

    // ===== Content Genius (AI content briefs) =====
    if (path === '/content-genius/generate' && method === 'POST') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      const { keyword, targetAudience, tone, wordCount, businessContext } = body
      if (!keyword) return json({ error: 'Keyword required' }, 400)

      const db = await getDb()
      const briefId = uuidv4()

      // Pull SearchAtlas keyword context if the client has a linked project
      const user = await db.collection('users').findOne({ id: decoded.id })
      let saContext = ''
      try {
        if (user?.searchAtlasProjectId) {
          const sa = await saFetch(`https://keyword.searchatlas.com/api/v1/rank-tracker/${user.searchAtlasProjectId}/keywords-details/`)
          if (sa.ok) {
            const kws = (sa.body.results || sa.body || []).slice(0, 25).map(k => `${k.keyword || k.name || ''} (pos ${k.position || k.current_position || '?'})`).filter(Boolean).join(', ')
            if (kws) saContext = `\nExisting tracked keywords for this brand: ${kws}`
          }
        }
      } catch (e) {}

      const systemPrompt = `You are Beyond Marketing's Content Genius — a senior SEO content strategist. Produce a comprehensive, SEO-optimized content brief. Return STRICT JSON only:
{
  "title": "<compelling H1 title with primary keyword>",
  "metaTitle": "<50-60 char meta title>",
  "metaDescription": "<140-160 char meta description>",
  "targetKeyword": "<primary keyword>",
  "secondaryKeywords": ["<sk1>","<sk2>","<sk3>","<sk4>","<sk5>"],
  "searchIntent": "<informational|commercial|transactional|navigational>",
  "wordCount": <number>,
  "outline": [
    {"heading": "<H2 heading>", "level": "H2", "notes": "<what to cover>", "keywords": ["<kw>"]},
    {"heading": "<H3 sub>", "level": "H3", "notes": "<detail>", "keywords": []}
  ],
  "hooks": ["<opening hook option 1>","<hook 2>","<hook 3>"],
  "faqs": [{"q":"<question>","a":"<short answer>"}, {"q":"<q2>","a":"<a2>"}, {"q":"<q3>","a":"<a3>"}],
  "cta": "<recommended call-to-action>",
  "internalLinkIdeas": ["<idea 1>","<idea 2>","<idea 3>"],
  "externalAuthorityLinks": ["<authority source topic 1>","<topic 2>"]
}
Be sharp, specific and premium. No markdown, only JSON.`

      const userPrompt = `Primary keyword: ${keyword}
Target audience: ${targetAudience || 'small-to-mid business owners'}
Tone: ${tone || 'professional, clear, confident'}
Word count target: ${wordCount || 1500}
Business context: ${businessContext || 'A modern marketing agency called Beyond Marketing that builds connected business growth systems.'}${saContext}

Produce the content brief JSON now.`

      let brief
      const tryModel = async (model) => {
        const completion = await llm.chat.completions.create({
          model,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          response_format: { type: 'json_object' },
        })
        return JSON.parse(completion.choices[0].message.content)
      }
      try { brief = await tryModel('gpt-4o-mini') }
      catch (e1) {
        try { brief = await tryModel('gpt-4o') }
        catch (e2) {
          console.error('Content Genius LLM failed:', e2?.message || e2)
          return json({ error: 'AI service unavailable. Please try again shortly.' }, 502)
        }
      }

      const doc = { id: briefId, userId: decoded.id, keyword, targetAudience, tone, wordCount, businessContext, brief, createdAt: new Date() }
      await db.collection('contentBriefs').insertOne(doc)
      return json({ id: briefId, brief })
    }

    if (path === '/content-genius/briefs' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      const list = await db.collection('contentBriefs').find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(50).toArray()
      return json({ briefs: list.map(b => ({ id: b.id, keyword: b.keyword, title: b.brief?.title, createdAt: b.createdAt })) })
    }

    if (path.startsWith('/content-genius/briefs/') && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const db = await getDb()
      const doc = await db.collection('contentBriefs').findOne({ id, userId: decoded.id })
      if (!doc) return json({ error: 'Not found' }, 404)
      return json({ id: doc.id, keyword: doc.keyword, brief: doc.brief, createdAt: doc.createdAt })
    }

    if (path.startsWith('/content-genius/briefs/') && method === 'DELETE') {
      const decoded = verifyToken(getToken(request))
      if (!decoded) return json({ error: 'Unauthorized' }, 401)
      const id = path.split('/')[3]
      const db = await getDb()
      await db.collection('contentBriefs').deleteOne({ id, userId: decoded.id })
      return json({ ok: true })
    }

    // ===== White-Label Public Report =====
    if (path.startsWith('/report/') && method === 'GET') {
      const hash = path.split('/')[2]
      if (!hash) return json({ error: 'Missing hash' }, 400)

      const db = await getDb()
      // Try every admin's key until we find the project with this hash
      const admins = await db.collection('users').find({ role: 'admin' }).toArray()
      const keys = [...new Set([SEARCHATLAS_KEY, ...admins.map(a => a.searchAtlasApiKey).filter(Boolean)])]
      let project = null
      for (const k of keys) {
        const sa = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/', {}, k)
        if (sa.ok && sa.body.results) {
          const found = sa.body.results.find(p => p.public_share_hash === hash)
          if (found) { project = found; break }
        }
      }
      if (!project) return json({ error: 'Report not found' }, 404)

      // Try to match to a client for branding
      const client = await db.collection('users').findOne({ searchAtlasProjectId: project.id })

      return json({
        report: {
          hostname: project.hostname,
          generatedAt: new Date().toISOString(),
          updatedAt: project.targeted_keywords_updated_at,
          client: client ? { name: client.name, company: client.company } : null,
          metrics: {
            trackedKeywords: project.tracked_keywords_count,
            avgPosition: project.position_legends?.current_avg_position,
            previousAvgPosition: project.position_legends?.previous_avg_position,
            positionDelta: project.position_legends?.position_delta,
            searchVisibility: project.search_visibility_report?.[0]?.sv,
            searchVisibilityPrev: project.search_visibility_report?.[1]?.sv,
            estimatedDailyTraffic: project.estimated_traffic_report?.[0]?.traffic,
          },
          serpsOverview: project.serps_overview?.[0] || null,
          keywordsUpDown: project.keywords_up_down_report,
          visibilityHistory: project.search_visibility_report || [],
          trafficHistory: project.estimated_traffic_report || [],
          publicShareHash: project.public_share_hash,
        },
      })
    }

    // ===== SearchAtlas Proxy (server-side, key never leaks) =====
    if (path === '/searchatlas/projects' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      const userKey = decoded ? await getUserSaKey(decoded.id) : null
      const r = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/', {}, userKey)
      if (!r.ok) return json({ error: 'SearchAtlas error', detail: r.body }, r.status)
      const projects = (r.body.results || []).map(p => ({
        id: p.id,
        hostname: p.hostname,
        trackedKeywords: p.tracked_keywords_count,
        targetedKeywords: p.targeted_keywords_count,
        currentAvgPosition: p.position_legends?.current_avg_position,
        previousAvgPosition: p.position_legends?.previous_avg_position,
        positionDelta: p.position_legends?.position_delta,
        searchVisibility: p.search_visibility_report?.[0]?.sv,
        serpsOverview: p.serps_overview?.[0] || null,
        keywordsUpDown: p.keywords_up_down_report,
        estimatedTraffic: p.estimated_traffic_report,
        publicShareHash: p.public_share_hash,
        refreshInterval: p.refresh_interval,
        updatedAt: p.targeted_keywords_updated_at,
      }))
      return json({ projects })
    }

    if (path.startsWith('/searchatlas/projects/') && path.endsWith('/keywords') && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      const userKey = decoded ? await getUserSaKey(decoded.id) : null
      const id = path.split('/')[3]
      const r = await saFetch(`https://keyword.searchatlas.com/api/v1/rank-tracker/${id}/keywords-details/`, {}, userKey)
      if (!r.ok) return json({ error: 'SearchAtlas error', detail: r.body }, r.status)
      return json({ keywords: r.body.results || r.body })
    }

    if (path === '/searchatlas/gbp' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      const userKey = decoded ? await getUserSaKey(decoded.id) : null
      const r = await saFetch('https://keyword.searchatlas.com/api/v3/google-business/', {}, userKey)
      if (!r.ok) return json({ error: 'SearchAtlas error', detail: r.body }, r.status)
      const businesses = (r.body.results || []).map(b => ({
        id: b.id,
        name: b.business_name,
        address: b.address,
        rating: b.rating,
        reviews: b.reviews,
        keywords: b.keywords,
        publicShareHash: b.public_share_hash,
        keywordBreakdown: (b.keyword_breakdown || []).map(k => ({
          keyword: k.keyword,
          averagePosition: k.gmb_average_position,
          bestPosition: k.gmb_best_position,
          worstPosition: k.gmb_worst_position,
          gridSize: k.grid_size,
        })),
      }))
      return json({ businesses })
    }

    // ===== OTTO — AI SEO Autopilot =====
    if (path === '/searchatlas/otto' && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      const userKey = decoded ? await getUserSaKey(decoded.id) : null
      const r = await saFetch('https://sa.searchatlas.com/api/v2/otto-projects/', {}, userKey)
      if (!r.ok) return json({ error: 'OTTO error', detail: r.body }, r.status)
      const otto = (r.body.results || []).map(o => ({
        uuid: o.uuid,
        hostname: o.hostname,
        installed: o.pixel_tag_state,
        installationMethod: o.installation_method,
        cms: o.detected_cms,
        installLabel: o.pixel_state_display?.label,
        installStatus: o.pixel_state_display?.severity,
        autopilotActive: o.autopilot_is_active,
        engaged: o.is_engaged,
        processingStatus: o.processing_status,
        processingState: o.processing_state,
        timeSavedMinutes: o.time_saved_total,
        aiGradeOverall: o.ai_grade_overall,
        aiGradeBefore: o.ai_grade_overall_before,
        aiGradeDelta: o.ai_grade_overall_delta,
        holisticScores: o.holistic_scores,
        holisticScoresBefore: o.holistic_scores_before,
        holisticScoresDelta: o.holistic_scores_delta,
        afterSummary: o.after_summary,
        pagesWithIssues: o.pages_with_issues,
        lastCrawl: o.last_crawl,
        lastAnalysis: o.last_analysis,
        lastDeployedAt: o.last_deploy_event_timestamp,
        nextAnalysisAt: o.next_analysis_at,
        pixelHtml: o.pixel_html,
        pixelHtmlGtm: o.pixel_html_gtm,
        connected: o.connected_data,
        knowledgeGraphId: o.knowledge_graph_id,
        knowledgeGraphProgress: o.knowledge_graph_progress,
        siteAuditId: o.site_audit,
      }))
      return json({ total: r.body.count, otto })
    }

    if (path.startsWith('/searchatlas/otto/') && method === 'GET') {
      const decoded = verifyToken(getToken(request))
      const userKey = decoded ? await getUserSaKey(decoded.id) : null
      const uuid = path.split('/')[3]
      const r = await saFetch(`https://sa.searchatlas.com/api/v2/otto-projects/${uuid}/`, {}, userKey)
      if (!r.ok) return json({ error: 'OTTO error', detail: r.body }, r.status)
      return json({ otto: r.body })
    }

    // ===== ADMIN =====
    if (path.startsWith('/admin/')) {
      const decoded = verifyToken(getToken(request))
      if (!decoded || decoded.role !== 'admin') return json({ error: 'Admin only' }, 403)
      const db = await getDb()

      if (path === '/admin/overview' && method === 'GET') {
        const [users, audits, contacts, projects, tasks] = await Promise.all([
          db.collection('users').countDocuments({}),
          db.collection('audits').countDocuments({}),
          db.collection('contacts').countDocuments({}),
          db.collection('projects').countDocuments({}),
          db.collection('tasks').countDocuments({}),
        ])
        const recentUsers = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(10).toArray()
        const recentAudits = await db.collection('audits').find({}).sort({ createdAt: -1 }).limit(10).toArray()
        return json({
          stats: { users, audits, contacts, projects, tasks },
          recentUsers: recentUsers.map(u => ({ id: u.id, name: u.name, email: u.email, company: u.company, role: u.role, createdAt: u.createdAt })),
          recentAudits: recentAudits.map(a => ({ id: a.id, name: a.name, email: a.email, website: a.website, industry: a.industry, status: a.status, healthScore: a.audit?.healthScore, createdAt: a.createdAt })),
        })
      }

      if (path === '/admin/clients' && method === 'GET') {
        const list = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
        return json({ clients: list.map(u => ({
          id: u.id, name: u.name, email: u.email, company: u.company, role: u.role,
          phone: u.phone || '', website: u.website || '', status: u.status || 'active',
          notes: u.notes || '',
          searchAtlasProjectId: u.searchAtlasProjectId || null,
          searchAtlasHostname: u.searchAtlasHostname || null,
          createdAt: u.createdAt,
        })) })
      }

      if (path === '/admin/clients' && method === 'POST') {
        const body = await request.json()
        if (!body.name || !body.email) return json({ error: 'Name and email required' }, 400)
        const email = body.email.toLowerCase()
        const existing = await db.collection('users').findOne({ email })
        if (existing) return json({ error: 'Email already exists' }, 409)
        const rawPassword = body.password || Math.random().toString(36).slice(2, 12) + 'A1!'
        const hash = await bcrypt.hash(rawPassword, 10)
        const doc = {
          id: uuidv4(),
          name: body.name, email,
          company: body.company || '', phone: body.phone || '', website: body.website || '',
          notes: body.notes || '', status: body.status || 'active',
          password: hash, role: body.role || 'client',
          searchAtlasProjectId: body.searchAtlasProjectId || null,
          searchAtlasHostname: body.searchAtlasHostname || null,
          createdAt: new Date(),
        }
        await db.collection('users').insertOne(doc)
        const returned = { ...doc }; delete returned.password; delete returned._id
        return json({ client: returned, tempPassword: body.password ? undefined : rawPassword })
      }

      if (path.startsWith('/admin/clients/') && method === 'DELETE') {
        const id = path.split('/')[3]
        const target = await db.collection('users').findOne({ id })
        if (!target) return json({ error: 'Not found' }, 404)
        if (target.email === decoded.email) return json({ error: 'You cannot delete yourself' }, 400)
        await db.collection('users').deleteOne({ id })
        await db.collection('projects').deleteMany({ userId: id })
        await db.collection('tasks').deleteMany({ userId: id })
        await db.collection('contentBriefs').deleteMany({ userId: id })
        return json({ ok: true })
      }

      if (path === '/admin/audits' && method === 'GET') {
        const list = await db.collection('audits').find({}).sort({ createdAt: -1 }).limit(200).toArray()
        return json({ audits: list.map(a => ({
          id: a.id, name: a.name, email: a.email, website: a.website, industry: a.industry,
          status: a.status, healthScore: a.audit?.healthScore, positioning: a.audit?.positioning,
          leadStatus: a.leadStatus || 'new', adminNotes: a.adminNotes || '',
          createdAt: a.createdAt,
        })) })
      }

      if (path.startsWith('/admin/audits/') && method === 'GET') {
        const id = path.split('/')[3]
        const a = await db.collection('audits').findOne({ id })
        if (!a) return json({ error: 'Not found' }, 404)
        const doc = { ...a }; delete doc._id
        return json({ audit: doc })
      }

      if (path.startsWith('/admin/audits/') && method === 'PATCH') {
        const id = path.split('/')[3]
        const body = await request.json()
        const $set = {}
        if ('leadStatus' in body) $set.leadStatus = body.leadStatus
        if ('adminNotes' in body) $set.adminNotes = body.adminNotes
        await db.collection('audits').updateOne({ id }, { $set })
        return json({ ok: true })
      }

      if (path.startsWith('/admin/audits/') && method === 'DELETE') {
        const id = path.split('/')[3]
        await db.collection('audits').deleteOne({ id })
        return json({ ok: true })
      }

      if (path === '/admin/contacts' && method === 'GET') {
        const list = await db.collection('contacts').find({}).sort({ createdAt: -1 }).limit(200).toArray()
        return json({ contacts: list.map(c => ({
          id: c.id, name: c.name, email: c.email, company: c.company, message: c.message,
          leadStatus: c.leadStatus || 'new', adminNotes: c.adminNotes || '',
          createdAt: c.createdAt,
        })) })
      }

      if (path.startsWith('/admin/contacts/') && method === 'PATCH') {
        const id = path.split('/')[3]
        const body = await request.json()
        const $set = {}
        if ('leadStatus' in body) $set.leadStatus = body.leadStatus
        if ('adminNotes' in body) $set.adminNotes = body.adminNotes
        await db.collection('contacts').updateOne({ id }, { $set })
        return json({ ok: true })
      }

      if (path.startsWith('/admin/contacts/') && method === 'DELETE') {
        const id = path.split('/')[3]
        await db.collection('contacts').deleteOne({ id })
        return json({ ok: true })
      }

      if (path === '/admin/all-projects' && method === 'GET') {
        const list = await db.collection('projects').find({}).sort({ createdAt: -1 }).limit(500).toArray()
        const users = await db.collection('users').find({}, { projection: { id: 1, name: 1, email: 1, company: 1 } }).toArray()
        const uMap = Object.fromEntries(users.map(u => [u.id, u]))
        return json({ projects: list.map(p => { const c = uMap[p.userId]; return { id: p.id, userId: p.userId, name: p.name, phase: p.phase, status: p.status, progress: p.progress, createdAt: p.createdAt, client: c ? { name: c.name, company: c.company } : null } }) })
      }

      if (path === '/admin/all-projects' && method === 'POST') {
        const body = await request.json()
        if (!body.name || !body.userId) return json({ error: 'name & userId required' }, 400)
        const doc = { id: uuidv4(), userId: body.userId, name: body.name, phase: body.phase || 'Plan', status: body.status || 'In progress', progress: body.progress ?? 0, createdAt: new Date() }
        await db.collection('projects').insertOne(doc)
        return json({ project: doc })
      }

      if (path.startsWith('/admin/all-projects/') && method === 'PATCH') {
        const id = path.split('/')[3]
        const body = await request.json()
        const $set = {}
        for (const k of ['name', 'phase', 'status', 'progress']) if (k in body) $set[k] = body[k]
        await db.collection('projects').updateOne({ id }, { $set })
        return json({ ok: true })
      }

      if (path.startsWith('/admin/all-projects/') && method === 'DELETE') {
        const id = path.split('/')[3]
        await db.collection('projects').deleteOne({ id })
        return json({ ok: true })
      }

      if (path === '/admin/settings' && method === 'GET') {
        const me = await db.collection('users').findOne({ id: decoded.id })
        const k = me?.searchAtlasApiKey || ''
        return json({
          name: me?.name,
          email: me?.email,
          company: me?.company,
          searchAtlasApiKey: k ? (k.slice(0, 6) + '••••••' + k.slice(-4)) : '',
          searchAtlasApiKeySet: !!k,
        })
      }

      if (path === '/admin/settings' && method === 'PATCH') {
        const body = await request.json()
        const $set = {}
        if ('name' in body) $set.name = body.name
        if ('company' in body) $set.company = body.company
        if ('searchAtlasApiKey' in body) {
          const k = (body.searchAtlasApiKey || '').trim()
          $set.searchAtlasApiKey = k || null
        }
        await db.collection('users').updateOne({ id: decoded.id }, { $set })
        return json({ ok: true })
      }

      if (path === '/admin/settings/test-sa-key' && method === 'POST') {
        const body = await request.json()
        const key = (body.searchAtlasApiKey || '').trim()
        if (!key) return json({ error: 'Key required' }, 400)
        const r = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/', {}, key)
        if (!r.ok) return json({ ok: false, error: 'Invalid key' }, 200)
        return json({ ok: true, projectCount: r.body.count || (r.body.results || []).length })
      }

      if (path.startsWith('/admin/clients/') && method === 'PATCH') {
        const id = path.split('/')[3]
        const body = await request.json()
        const $set = {}
        for (const k of ['name', 'company', 'phone', 'website', 'notes', 'status', 'role', 'searchAtlasProjectId', 'searchAtlasHostname']) {
          if (k in body) $set[k] = body[k]
        }
        if (body.password) $set.password = await bcrypt.hash(body.password, 10)
        await db.collection('users').updateOne({ id }, { $set })
        return json({ ok: true })
      }
    }

    return json({ error: 'Not found', path, method }, 404)
  } catch (err) {
    console.error('API error:', err)
    return json({ error: err?.message || 'Server error' }, 500)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
