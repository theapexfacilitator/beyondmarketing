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

// SearchAtlas API helper
async function saFetch(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: { 'X-API-Key': SEARCHATLAS_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const text = await r.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  return { status: r.status, ok: r.ok, body }
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

      // Try to pull real SearchAtlas project data (user's linked project, else first available)
      let searchAtlas = null
      try {
        const sa = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/')
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

    // ===== SearchAtlas Proxy (server-side, key never leaks) =====
    if (path === '/searchatlas/projects' && method === 'GET') {
      const r = await saFetch('https://keyword.searchatlas.com/api/v1/rank-tracker/')
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
      const id = path.split('/')[3]
      const r = await saFetch(`https://keyword.searchatlas.com/api/v1/rank-tracker/${id}/keywords-details/`)
      if (!r.ok) return json({ error: 'SearchAtlas error', detail: r.body }, r.status)
      return json({ keywords: r.body.results || r.body })
    }

    if (path === '/searchatlas/gbp' && method === 'GET') {
      const r = await saFetch('https://keyword.searchatlas.com/api/v3/google-business/')
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
        return json({ clients: list.map(u => ({ id: u.id, name: u.name, email: u.email, company: u.company, role: u.role, searchAtlasProjectId: u.searchAtlasProjectId || null, searchAtlasHostname: u.searchAtlasHostname || null, createdAt: u.createdAt })) })
      }

      if (path === '/admin/audits' && method === 'GET') {
        const list = await db.collection('audits').find({}).sort({ createdAt: -1 }).limit(100).toArray()
        return json({ audits: list.map(a => ({ id: a.id, name: a.name, email: a.email, website: a.website, industry: a.industry, status: a.status, healthScore: a.audit?.healthScore, positioning: a.audit?.positioning, createdAt: a.createdAt })) })
      }

      if (path === '/admin/contacts' && method === 'GET') {
        const list = await db.collection('contacts').find({}).sort({ createdAt: -1 }).limit(100).toArray()
        return json({ contacts: list.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.company, message: c.message, createdAt: c.createdAt })) })
      }

      if (path.startsWith('/admin/clients/') && method === 'PATCH') {
        const id = path.split('/')[3]
        const body = await request.json()
        const $set = {}
        if (body.role) $set.role = body.role
        if (body.company !== undefined) $set.company = body.company
        if ('searchAtlasProjectId' in body) $set.searchAtlasProjectId = body.searchAtlasProjectId
        if ('searchAtlasHostname' in body) $set.searchAtlasHostname = body.searchAtlasHostname
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
