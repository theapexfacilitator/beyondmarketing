'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowRight, Sparkles, Zap, Shield, LineChart, Target, Layers, Cpu, Rocket, Users, Database,
  Compass, Hammer, TrendingUp, CheckCircle2, ChevronRight, Menu, X, Play, BookOpen,
  Search, PenTool, Workflow, BarChart3, Bell, LogOut, ArrowUpRight, ArrowDownRight,
  Circle, Globe, Mail, MessageSquare, PieChart as PieIcon, Loader2, Star
} from 'lucide-react'
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

const HERO_IMG = 'https://images.unsplash.com/photo-1655993810480-c15dccf9b3a0'
const CONNECTED_IMG = 'https://images.unsplash.com/photo-1597733336794-12d05021d510'
const ANALYTICS_IMG = 'https://images.pexels.com/photos/7947754/pexels-photo-7947754.jpeg'
const DASHBOARD_IMG = 'https://images.pexels.com/photos/34069/pexels-photo.jpg'
const TEAM_IMG = 'https://images.unsplash.com/photo-1580983553600-c49a1d083f54'
const GROWTH_IMG = 'https://images.unsplash.com/photo-1586448646505-e7bcafcd83a1'

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'approach', label: 'Our Approach' },
  { id: 'services', label: 'Services', dropdown: [
    { id: 'services', label: 'All Services', desc: 'Overview of every capability', icon: 'Layers' },
    { id: 'plan', label: 'Plan', desc: 'Strategy, audits, roadmaps', icon: 'Compass' },
    { id: 'build', label: 'Build', desc: 'SEO, content, CRM, automation', icon: 'Hammer' },
    { id: 'grow', label: 'Grow', desc: 'Reporting, insights, optimisation', icon: 'TrendingUp' },
    { id: 'connected', label: 'Connected Business Systems', desc: 'Our differentiator', icon: 'Layers' },
  ]},
  { id: 'learning', label: 'Learning Hub' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
]

function useRoute() {
  const [route, setRoute] = useState('home')
  useEffect(() => {
    const read = () => {
      const h = (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'home'
      setRoute(h || 'home')
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])
  const go = (r) => { window.location.hash = r; setRoute(r); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return [route, go]
}

// ---------- Shared UI ----------
function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 group">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center shadow-lg shadow-blue-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold tracking-tight">Beyond Marketing</span>
    </button>
  )
}

function Nav({ go, route, user, onLogout }) {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const iconMap = { Compass, Hammer, TrendingUp, Layers }
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Logo onClick={() => go('home')} />
        <nav className="hidden lg:flex items-center gap-1 relative">
          {NAV.map(n => n.dropdown ? (
            <div key={n.id} className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${['services','plan','build','grow','connected'].includes(route) ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}>
                {n.label}
                <svg className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[520px]">
                  <div className="rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 p-2 grid grid-cols-2 gap-1">
                    {n.dropdown.map(d => {
                      const Ic = iconMap[d.icon] || Layers
                      return (
                        <button key={d.id} onClick={() => { go(d.id); setServicesOpen(false) }}
                          className="text-left p-3 rounded-xl hover:bg-secondary/70 transition-colors group flex gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 grid place-items-center flex-shrink-0 group-hover:bg-blue-500/20">
                            <Ic className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{d.label}</div>
                            <div className="text-xs text-muted-foreground">{d.desc}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button key={n.id} onClick={() => go(n.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${route === n.id ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => go('portal')}>Portal</Button>
              <Button variant="outline" size="sm" onClick={onLogout}><LogOut className="w-3.5 h-3.5 mr-1.5" />Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => go('login')}>Sign in</Button>
              <Button size="sm" onClick={() => go('contact')} className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">
                Book Discovery Call <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </>
          )}
          <button className="lg:hidden ml-1" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/50 bg-background/95">
          <div className="container mx-auto px-4 py-3 grid gap-1">
            {NAV.map(n => n.dropdown ? (
              <div key={n.id}>
                <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">{n.label}</div>
                {n.dropdown.map(d => (
                  <button key={d.id} onClick={() => { go(d.id); setOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">{d.label}</button>
                ))}
              </div>
            ) : (
              <button key={n.id} onClick={() => { go(n.id); setOpen(false) }}
                className="text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">{n.label}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function Footer({ go }) {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="container mx-auto px-4 py-14 grid md:grid-cols-4 gap-8">
        <div>
          <Logo onClick={() => go('home')} />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">Simplifying Marketing. Connecting Business. Empowering Growth.</p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Framework</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => go('plan')} className="hover:text-foreground">Plan</button></li>
            <li><button onClick={() => go('build')} className="hover:text-foreground">Build</button></li>
            <li><button onClick={() => go('grow')} className="hover:text-foreground">Grow</button></li>
            <li><button onClick={() => go('connected')} className="hover:text-foreground">Connected Systems</button></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Platform</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => go('learning')} className="hover:text-foreground">Learning Hub</button></li>
            <li><button onClick={() => go('pricing')} className="hover:text-foreground">Pricing</button></li>
            <li><button onClick={() => go('login')} className="hover:text-foreground">Client Portal</button></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => go('approach')} className="hover:text-foreground">Our Approach</button></li>
            <li><button onClick={() => go('contact')} className="hover:text-foreground">Contact</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Beyond Marketing. A Business Growth Operating System.</div>
    </footer>
  )
}

// ---------- Home ----------
function Home({ go }) {
  return (
    <div>
      <Hero go={go} />
      <LogoBar />
      <ProblemSection />
      <FrameworkSection go={go} />
      <ConnectedSection />
      <ProcessSection />
      <AuditCTA go={go} />
      <TestimonialsSection />
      <FinalCTA go={go} />
    </div>
  )
}

function Hero({ go }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none mask-fade-b" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 pt-20 pb-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-blue-500/30 bg-blue-500/5 text-blue-300">
            <Sparkles className="w-3 h-3 mr-1.5" /> The Business Growth Operating System
          </Badge>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Marketing shouldn't <br />
            <span className="text-gradient">be complicated.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Beyond Marketing connects marketing, sales, technology, automation and reporting into one simplified ecosystem — so you understand how you grow and own your data forever.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => document.getElementById('audit-tool')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90 shadow-lg shadow-blue-500/20">
              Get your free Marketing Audit <Sparkles className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => go('approach')}>See our approach <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Own your data</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> One connected system</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No lock-in</span>
          </div>
        </div>

        <div className="mt-16 relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" />
          <div className="rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-blue-500/10 glow-blue">
            <img src={HERO_IMG} alt="Connected business systems" className="w-full h-[420px] object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

function LogoBar() {
  const items = ['HubSpot', 'SearchAtlas', 'Google Ads', 'Meta', 'Stripe', 'Zapier', 'Slack', 'Airtable']
  return (
    <section className="border-y border-border/50 bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">Connecting the tools growing businesses trust</div>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 opacity-70">
          {items.map(i => <span key={i} className="text-sm font-medium text-muted-foreground">{i}</span>)}
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  const points = [
    { icon: Layers, title: 'Fragmented tools', desc: 'Websites, CRM, ads, email, analytics — all disconnected and duplicated.' },
    { icon: Search, title: 'No single truth', desc: 'Reports live in five dashboards. Decisions get made on guesswork.' },
    { icon: Shield, title: 'You don\'t own your data', desc: 'Agencies keep the keys. When you leave, your history walks out the door.' },
    { icon: Cpu, title: 'AI without a system', desc: 'Bolted-on AI without connected workflows just adds more noise.' },
  ]
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mb-14">
        <div className="text-sm text-blue-400 font-medium mb-3">Why businesses struggle</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Most agencies sell services.<br />We build systems.</h2>
        <p className="mt-4 text-muted-foreground">Marketing is fragmented by design. That's why growth feels chaotic and expensive. We remove the fragmentation.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {points.map(p => (
          <Card key={p.title} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 grid place-items-center mb-3">
                <p.icon className="w-5 h-5 text-blue-400" />
              </div>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardDescription>{p.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

function FrameworkSection({ go }) {
  const phases = [
    { id: 'plan', icon: Compass, color: 'from-blue-500 to-cyan-400', title: 'Plan', tagline: 'Understand where you are and where you\'re going.',
      items: ['Marketing Audit', 'Growth Strategy', 'Brand Positioning', 'KPI Planning', 'Roadmap'] },
    { id: 'build', icon: Hammer, color: 'from-violet-500 to-fuchsia-400', title: 'Build', tagline: 'Execute through connected systems.',
      items: ['Search Authority', 'Content & Campaigns', 'Connected Systems', 'CRM & Automation', 'Implementation'] },
    { id: 'grow', icon: TrendingUp, color: 'from-emerald-500 to-teal-400', title: 'Grow', tagline: 'Continually improve with data you own.',
      items: ['Reporting & KPI Dashboards', 'SearchAtlas Insights', 'AI Recommendations', 'Quarterly Reviews', 'Optimisation'] },
  ]
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-sm text-blue-400 font-medium mb-3">The framework</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Plan → Build → Grow</h2>
        <p className="mt-4 text-muted-foreground">One connected framework replaces a dozen disconnected services.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {phases.map((p, i) => (
          <Card key={p.id} className="relative overflow-hidden bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-all hover:-translate-y-1">
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${p.color} opacity-20 blur-3xl`} />
            <CardHeader className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} grid place-items-center mb-3 shadow-lg`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Phase {i + 1}</div>
              <CardTitle className="text-3xl">{p.title}</CardTitle>
              <CardDescription className="text-base">{p.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-2 text-sm">
                {p.items.map(it => (
                  <li key={it} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {it}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" className="mt-5 -ml-3" onClick={() => go(p.id)}>
                Explore {p.title} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ConnectedSection() {
  const systems = ['Websites','Hosting','CRM','Marketing','Sales','Email','Automation','AI','Analytics','Forms','Phone','Reporting','Integrations']
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-sm text-blue-400 font-medium mb-3">Our differentiator</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Connected Business Systems</h2>
          <p className="mt-4 text-muted-foreground text-lg">We don't sell marketing services — we build growth ecosystems where every part of your business is talking to every other part.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {systems.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full text-xs border border-border/60 bg-secondary/50">{s}</span>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, t: 'You own your data', d: 'Always.' },
              { icon: Zap, t: 'One source of truth', d: 'Every KPI in one place.' },
              { icon: Workflow, t: 'Automated flows', d: 'Lead → CRM → Report.' },
            ].map(f => (
              <div key={f.t} className="rounded-xl border border-border/60 p-4 bg-secondary/30">
                <f.icon className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-sm font-medium">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl" />
          <div className="relative rounded-2xl overflow-hidden border border-border/60">
            <img src={CONNECTED_IMG} alt="Connected systems" className="w-full h-[500px] object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    { t: 'Discovery', d: 'Deep-dive into your business, goals and current stack.' },
    { t: 'Strategy', d: 'Growth plan, positioning and roadmap tied to real KPIs.' },
    { t: 'Build', d: 'We assemble the connected system — website, CRM, automation.' },
    { t: 'Launch', d: 'Go live with dashboards, tracking and workflows in place.' },
    { t: 'Grow', d: 'Monthly reporting, AI insights and quarterly optimisation.' },
  ]
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mb-14">
        <div className="text-sm text-blue-400 font-medium mb-3">Our process</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Five steps. One system.</h2>
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        {steps.map((s, i) => (
          <div key={s.t} className="relative rounded-xl border border-border/60 p-5 bg-secondary/20">
            <div className="text-4xl font-semibold text-blue-400/40">{String(i + 1).padStart(2, '0')}</div>
            <div className="mt-2 font-semibold">{s.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------- SearchAtlas Domain Analyzer (replaces AI audit) ----------
function AuditCTA({ go }) {
  const [url, setUrl] = useState('')

  const analyze = () => {
    let clean = url.trim()
    if (!clean) { toast.error('Enter a website URL'); return }
    // Strip protocol and trailing slash so SearchAtlas gets a clean domain
    clean = clean.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    const target = `https://data.searchenginelabs.com/go/url/?domain_analyzer=${encodeURIComponent(clean)}&hostname=dashboard.searchatlas.com&userId=211706`
    window.open(target, '_blank', 'noopener,noreferrer')
    toast.success('Opening your free audit in a new tab…')
  }

  return (
    <section id="audit-tool" className="container mx-auto px-4 py-24">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-secondary/60 via-secondary/30 to-background p-8 md:p-14 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300 mb-4">
              <Sparkles className="w-3 h-3 mr-1.5" /> Free Marketing Audit
            </Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">See exactly how your website is performing.</h2>
            <p className="mt-4 text-muted-foreground text-lg">Run a full domain analysis powered by SearchAtlas — SEO score, keyword opportunities, backlinks, technical health and competitive positioning. Instant. Free. No sales call.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full SEO score &amp; health check</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keyword rankings &amp; opportunities</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Backlink profile &amp; authority</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Technical SEO issues</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Competitor comparison</li>
            </ul>
          </div>

          <Card className="bg-background/80 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle>Analyze your website</CardTitle>
              <CardDescription>Enter your domain — we&apos;ll open a full audit report instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') analyze() }}
                    placeholder="yourbusiness.com"
                    className="pl-9 h-12 text-base"
                  />
                </div>
                <Button onClick={analyze} size="lg" className="h-12 bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90 shadow-lg shadow-blue-500/20">
                  Analyze My Site <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Shield className="w-3 h-3" /> Powered by SearchAtlas · Opens in a new tab
                </div>
              </div>

              <Separator className="my-5" />
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: 'SEO Score', v: '0-100' },
                  { l: 'Keywords', v: 'Tracked' },
                  { l: 'Backlinks', v: 'Analyzed' },
                ].map(x => (
                  <div key={x.l} className="p-2 rounded-lg border border-border/60 bg-secondary/30">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{x.l}</div>
                    <div className="text-sm font-semibold mt-0.5">{x.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Want us to fix what the audit finds?</div>
                  <div className="text-xs text-muted-foreground">Book a discovery call — we&apos;ll build the system.</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => go('contact')}>Book call <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function AuditResult({ result, onBook }) {
  const score = Math.max(0, Math.min(100, result.healthScore || 0))
  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
  return (
    <div className="relative mt-10 rounded-2xl border border-blue-500/30 bg-background/80 backdrop-blur p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="text-center">
          <div className={`text-6xl font-semibold ${scoreColor}`}>{score}</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Health Score</div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-blue-400 font-medium">Positioning</div>
          <div className="text-lg font-medium mt-1">{result.positioning}</div>
          <div className="mt-3 text-sm text-muted-foreground">{result.estimatedImpact}</div>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {result.topInsights?.map((it, i) => (
          <div key={i} className="rounded-xl border border-border/60 p-4 bg-secondary/30">
            <div className="text-xs text-blue-400 font-medium mb-1">Insight {i + 1}</div>
            <div className="text-sm">{it}</div>
          </div>
        ))}
      </div>
      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="plan"><Compass className="w-3.5 h-3.5 mr-1.5" />Plan</TabsTrigger>
          <TabsTrigger value="build"><Hammer className="w-3.5 h-3.5 mr-1.5" />Build</TabsTrigger>
          <TabsTrigger value="grow"><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Grow</TabsTrigger>
        </TabsList>
        {['plan', 'build', 'grow'].map(k => (
          <TabsContent key={k} value={k} className="mt-4">
            <div className="text-sm text-muted-foreground mb-3">{result[k]?.summary}</div>
            <ul className="grid md:grid-cols-2 gap-2">
              {result[k]?.actions?.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg border border-border/60 bg-secondary/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      <Separator className="my-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-blue-400 font-medium mb-2">Connected Systems Roadmap</div>
          <ul className="space-y-1.5">
            {result.connectedSystems?.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground"><ChevronRight className="w-4 h-4 text-blue-400" /> {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm text-blue-400 font-medium mb-2">Quick Wins</div>
          <ul className="space-y-1.5">
            {result.quickWins?.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground"><Zap className="w-4 h-4 text-amber-400" /> {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20">
        <div>
          <div className="font-semibold">Want us to build this system for you?</div>
          <div className="text-sm text-muted-foreground">Book a 30-min discovery call and we'll map it out.</div>
        </div>
        <Button onClick={onBook} className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">
          Book Discovery Call <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function TestimonialsSection() {
  const items = [
    { q: 'Beyond Marketing rebuilt our entire growth stack. For the first time we can see exactly what\'s working.', a: 'Sarah L.', r: 'CEO, B2B SaaS' },
    { q: 'They didn\'t just do our SEO — they connected our CRM, website and reporting. Game changer.', a: 'Marcus D.', r: 'Founder, Local Services' },
    { q: 'The AI audit alone was worth more than the last three agencies we worked with.', a: 'Priya R.', r: 'Head of Marketing' },
  ]
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-sm text-blue-400 font-medium mb-3">Client success</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Businesses growing on connected systems.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <Card key={i} className="bg-secondary/30 border-border/60">
            <CardContent className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm leading-relaxed">"{t.q}"</p>
              <div className="mt-4 text-sm">
                <div className="font-medium">{t.a}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function FinalCTA({ go }) {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-background p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">Ready to simplify how you grow?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Let's build your Business Growth Operating System.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => go('contact')} className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">
              Book Discovery Call <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => go('pricing')}>See pricing</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Sub Pages ----------
function ServicesOverview({ go }) {
  const phases = [
    { id: 'plan', icon: Compass, color: 'from-blue-500 to-cyan-400', title: 'Plan', tagline: 'Strategy, audits, roadmaps', bullets: ['Marketing Audit','Growth Strategy','Brand Positioning','KPI Planning','Quarterly Reviews'] },
    { id: 'build', icon: Hammer, color: 'from-violet-500 to-fuchsia-400', title: 'Build', tagline: 'SEO, content, CRM, automation', bullets: ['Search Authority','Content & Campaigns','CRM & Automation','Websites & Landing Pages','Analytics Setup'] },
    { id: 'grow', icon: TrendingUp, color: 'from-emerald-500 to-teal-400', title: 'Grow', tagline: 'Reporting, insights, optimisation', bullets: ['KPI Dashboards','SearchAtlas & GA4','AI Insights','Growth Recommendations','Attribution & CRO'] },
    { id: 'connected', icon: Layers, color: 'from-amber-500 to-orange-400', title: 'Connected Business Systems', tagline: 'The core differentiator', bullets: ['Websites + Hosting + CRM','Marketing + Sales + Email','Automation + AI + Workflows','Analytics + Reporting','You own everything'] },
  ]
  return (
    <div>
      <PageHeader eyebrow="Services" title="One connected growth system." desc="Explore every capability of the Beyond Marketing Growth OS — organised around Plan, Build, Grow and Connected Business Systems." />
      <section className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-5">
        {phases.map(p => (
          <Card key={p.id} className="relative overflow-hidden bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-all hover:-translate-y-1 cursor-pointer" onClick={() => go(p.id)}>
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${p.color} opacity-20 blur-3xl`} />
            <CardHeader className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} grid place-items-center mb-3 shadow-lg`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">{p.title}</CardTitle>
              <CardDescription>{p.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-2 text-sm">
                {p.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" className="mt-5 -ml-3">
                Explore {p.title} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-sm text-blue-400 font-medium mb-2">Why it matters</div>
            <h2 className="text-3xl font-semibold">Not another agency. A growth operating system.</h2>
            <p className="mt-3 text-muted-foreground">Every service we deliver strengthens your connected ecosystem — so marketing, sales, technology and reporting all speak the same language.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Own your data','No lock-in','One source of truth','White-labelled reports','AI-augmented'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs border border-border/60 bg-background/60">{t}</span>
              ))}
            </div>
          </div>
          <img src={GROWTH_IMG} className="rounded-xl border border-border/60 w-full h-64 object-cover" alt="Growth" />
        </div>
      </section>

      <FinalCTA go={go} />
    </div>
  )
}

function PageHeader({ eyebrow, title, desc }) {
  return (
    <section className="container mx-auto px-4 pt-20 pb-8 text-center">
      <div className="text-sm text-blue-400 font-medium mb-3">{eyebrow}</div>
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">{title}</h1>
      {desc && <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">{desc}</p>}
    </section>
  )
}

function Approach({ go }) {
  return (
    <div>
      <PageHeader eyebrow="Our Approach" title="A growth partner, not another vendor." desc="We combine strategy, technology and reporting into one continuous system built around your business." />
      <section className="container mx-auto px-4 pb-16 grid md:grid-cols-3 gap-4">
        {[
          { i: Compass, t: 'Strategy first', d: 'We start by understanding your business, not selling services.' },
          { i: Layers, t: 'Systems thinking', d: 'Every recommendation strengthens your connected ecosystem.' },
          { i: Shield, t: 'You own everything', d: 'Domains, data, CRM, accounts — all in your name, always.' },
        ].map(f => (
          <Card key={f.t} className="bg-secondary/30"><CardHeader>
            <f.i className="w-6 h-6 text-blue-400 mb-2" />
            <CardTitle>{f.t}</CardTitle><CardDescription>{f.d}</CardDescription>
          </CardHeader></Card>
        ))}
      </section>
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <img src={TEAM_IMG} className="rounded-2xl border border-border/60" alt="Team" />
        <div>
          <h2 className="text-3xl font-semibold">Core values</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {['Simplicity','Transparency','Data Ownership','Innovation','Partnership','Sustainable Growth'].map(v => (
              <div key={v} className="p-3 rounded-lg border border-border/60 bg-secondary/30 text-sm">{v}</div>
            ))}
          </div>
        </div>
      </section>
      <FinalCTA go={go} />
    </div>
  )
}

function PhasePage({ phase, go }) {
  const data = {
    plan: {
      icon: Compass, color: 'from-blue-500 to-cyan-400', eyebrow: 'Phase 01',
      title: 'Plan', desc: 'Understand where you are and where you\'re going.',
      groups: [
        { t: 'Strategy', items: ['Marketing Audit','Business Growth Strategy','Brand Positioning','Competitor Analysis','Customer Journey Mapping'] },
        { t: 'Roadmap', items: ['Growth Roadmaps','KPI Planning','Marketing Planning','Quarterly Strategy Reviews'] },
        { t: 'Deliverables', items: ['Marketing Strategy','Growth Plan','Opportunity Analysis','Business Scorecard','Success Metrics'] },
      ],
    },
    build: {
      icon: Hammer, color: 'from-violet-500 to-fuchsia-400', eyebrow: 'Phase 02',
      title: 'Build', desc: 'Execute through connected marketing systems.',
      groups: [
        { t: 'Search Authority', items: ['Local SEO','Technical SEO','AI Search Optimisation','Google Business Profile','Keyword Strategy','Citation Management','Content Optimisation','SearchAtlas Optimisation','Link Building'] },
        { t: 'Content & Campaigns', items: ['Content Strategy','Website Copy','Blogs','Landing Pages','Email Marketing','Lead Magnets','Campaign Planning','Social Media','Case Studies','Video Strategy'] },
        { t: 'Implementation', items: ['Website Development','CRM Setup','Marketing Automation','Workflow Automation','Analytics Setup','Landing Pages','SEO Implementation','Dashboards','Integrations','Conversion Optimisation'] },
      ],
    },
    grow: {
      icon: TrendingUp, color: 'from-emerald-500 to-teal-400', eyebrow: 'Phase 03',
      title: 'Grow', desc: 'Continually improve with reporting you actually understand.',
      groups: [
        { t: 'Reporting', items: ['KPI Dashboards','SearchAtlas Reports','Google Analytics','Google Search Console','Google Business Profile','Campaign Reporting','Conversion Tracking'] },
        { t: 'Insights', items: ['AI Insights','Quarterly Reviews','Growth Recommendations','Revenue Attribution','Local SEO Insights'] },
      ],
    },
  }[phase]
  const P = data.icon
  return (
    <div>
      <section className="container mx-auto px-4 pt-20 pb-12 text-center relative">
        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${data.color} grid place-items-center shadow-2xl`}>
          <P className="w-8 h-8 text-white" />
        </div>
        <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{data.eyebrow}</div>
        <h1 className="text-6xl font-semibold tracking-tight mt-1">{data.title}</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">{data.desc}</p>
      </section>
      <section className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-4">
        {data.groups.map(g => (
          <Card key={g.t} className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>{g.t}</CardTitle></CardHeader>
            <CardContent><ul className="space-y-1.5 text-sm">
              {g.items.map(i => (<li key={i} className="flex gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{i}</li>))}
            </ul></CardContent>
          </Card>
        ))}
      </section>
      <FinalCTA go={go} />
    </div>
  )
}

function ConnectedPage({ go }) {
  return (
    <div>
      <PageHeader eyebrow="Core Service" title="Connected Business Systems" desc="Everything working together — one ecosystem for how your business grows." />
      <section className="container mx-auto px-4 py-8">
        <img src={CONNECTED_IMG} className="w-full h-[380px] object-cover rounded-2xl border border-border/60" alt="Connected" />
      </section>
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
        {[
          { t: 'Website + Hosting + CRM', d: 'Your marketing site, blog and portal all wired into HubSpot or your CRM of choice.' },
          { t: 'Marketing + Sales + Email', d: 'Leads flow from ads and content into sequenced nurtures with real attribution.' },
          { t: 'Automation + AI + Workflows', d: 'Repetitive work is automated. AI drafts, summarises and recommends.' },
          { t: 'Analytics + Reporting', d: 'SearchAtlas, GA4, GSC, GBP and revenue — one dashboard, one story.' },
        ].map(x => (
          <Card key={x.t} className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>{x.t}</CardTitle><CardDescription>{x.d}</CardDescription></CardHeader>
          </Card>
        ))}
      </section>
      <FinalCTA go={go} />
    </div>
  )
}

function Learning({ go }) {
  const courses = [
    { t: 'Marketing Fundamentals', l: 12, c: 'Foundations' },
    { t: 'Local SEO Playbook', l: 9, c: 'SEO' },
    { t: 'Building a Connected Stack', l: 7, c: 'Systems' },
    { t: 'CRM Setup in HubSpot', l: 14, c: 'CRM' },
    { t: 'AI for Marketers', l: 8, c: 'AI' },
    { t: 'Reporting that Drives Action', l: 6, c: 'Analytics' },
  ]
  return (
    <div>
      <PageHeader eyebrow="Learning Hub" title="Members-only growth education." desc="Courses, playbooks, SOPs and templates to master connected marketing." />
      <section className="container mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Card key={c.t} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-blue-500/30 bg-blue-500/5 text-blue-300">{c.c}</Badge>
              <CardTitle className="mt-2">{c.t}</CardTitle>
              <CardDescription>{c.l} lessons · self-paced</CardDescription>
            </CardHeader>
            <CardContent><Button size="sm" variant="outline"><Play className="w-3.5 h-3.5 mr-1.5" />Preview</Button></CardContent>
          </Card>
        ))}
      </section>
      <FinalCTA go={go} />
    </div>
  )
}

function Pricing({ go }) {
  const plans = [
    { n: 'Plan', price: '$1,500', p: 'month', tag: 'For strategy', features: ['Marketing Audit','Growth Strategy','Quarterly Reviews','Reporting Dashboard'] },
    { n: 'Build', price: '$4,500', p: 'month', tag: 'Most popular', features: ['Everything in Plan','SEO & Content','Connected Systems Setup','CRM + Automation','Landing Pages'], featured: true },
    { n: 'Grow', price: 'Custom', p: '', tag: 'Full ecosystem', features: ['Everything in Build','Dedicated Team','AI Insights','Full-service Reporting','Priority Support'] },
  ]
  return (
    <div>
      <PageHeader eyebrow="Pricing" title="Simple, scalable, aligned to growth." desc="No lock-in. You own everything we build." />
      <section className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-5">
        {plans.map(p => (
          <Card key={p.n} className={`relative ${p.featured ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10' : 'border-border/60'} bg-secondary/30`}>
            {p.featured && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-500 to-violet-500 text-white border-0">Most popular</Badge>}
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.tag}</div>
              <CardTitle className="text-3xl">{p.n}</CardTitle>
              <div className="text-4xl font-semibold mt-2">{p.price}<span className="text-sm text-muted-foreground font-normal">{p.p ? ' / ' + p.p : ''}</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-6">
                {p.features.map(f => <li key={f} className="flex gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{f}</li>)}
              </ul>
              <Button className="w-full" variant={p.featured ? 'default' : 'outline'} onClick={() => go('contact')}>Choose {p.n}</Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <FinalCTA go={go} />
    </div>
  )
}

function Contact({ go }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setSent(true)
      toast.success('Thanks — we\'ll be in touch within 24 hours.')
    } catch { toast.error('Something went wrong') }
  }
  return (
    <div>
      <PageHeader eyebrow="Contact" title="Book a discovery call." desc="Tell us about your business. We\'ll show you what a connected system looks like." />
      <section className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-secondary/30 border-border/60">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-xl font-semibold">Thanks!</div>
                <p className="text-muted-foreground mt-2">We&apos;ll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                <div><Label>Tell us about your business</Label><Textarea rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
                <Button type="submit" size="lg" className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">Book Discovery Call<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

// ---------- Auth ----------
function Auth({ mode, setUser, go }) {
  const [m, setM] = useState(mode || 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch(`/api/auth/${m === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      localStorage.setItem('bm_token', data.token)
      setUser(data.user)
      toast.success(m === 'login' ? 'Welcome back!' : 'Account created ✨')
      go('portal')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  return (
    <section className="container mx-auto px-4 py-20 max-w-md">
      <Card className="bg-secondary/30 border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl">{m === 'login' ? 'Client Portal Sign in' : 'Create your account'}</CardTitle>
          <CardDescription>{m === 'login' ? 'Access your growth dashboard.' : 'Get access to your dashboard & reports.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            {m === 'register' && (<>
              <div><Label>Full name</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            </>)}
            <div><Label>Email</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input required type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <Button disabled={loading} type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {m === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            {m === 'login' ? (
              <>New here? <button className="text-blue-400 hover:underline" onClick={() => setM('register')}>Create an account</button></>
            ) : (
              <>Have an account? <button className="text-blue-400 hover:underline" onClick={() => setM('login')}>Sign in</button></>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

// ---------- Admin Portal ----------
function AdminPortal({ user, go }) {
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [clients, setClients] = useState([])
  const [audits, setAudits] = useState([])
  const [contacts, setContacts] = useState([])
  const [saProjects, setSaProjects] = useState([])
  const [saGbp, setSaGbp] = useState([])
  const [selectedAudit, setSelectedAudit] = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null
  const h = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const load = async () => {
      const [ov, cl, au, co, sap, gbp] = await Promise.all([
        fetch('/api/admin/overview', { headers: h }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/clients', { headers: h }).then(r => r.ok ? r.json() : { clients: [] }),
        fetch('/api/admin/audits', { headers: h }).then(r => r.ok ? r.json() : { audits: [] }),
        fetch('/api/admin/contacts', { headers: h }).then(r => r.ok ? r.json() : { contacts: [] }),
        fetch('/api/searchatlas/projects').then(r => r.ok ? r.json() : { projects: [] }),
        fetch('/api/searchatlas/gbp').then(r => r.ok ? r.json() : { businesses: [] }),
      ])
      setOverview(ov)
      setClients(cl.clients || [])
      setAudits(au.audits || [])
      setContacts(co.contacts || [])
      setSaProjects(sap.projects || [])
      setSaGbp(gbp.businesses || [])
    }
    load()
  }, [])

  if (!overview) return <div className="container mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>

  const promoteUser = async (id, role) => {
    await fetch(`/api/admin/clients/${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    setClients(clients.map(c => c.id === id ? { ...c, role } : c))
    toast.success(`Updated role to ${role}`)
  }

  const linkProject = async (id, projectId, hostname) => {
    const pid = projectId ? Number(projectId) : null
    await fetch(`/api/admin/clients/${id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ searchAtlasProjectId: pid, searchAtlasHostname: hostname || null }) })
    setClients(clients.map(c => c.id === id ? { ...c, searchAtlasProjectId: pid, searchAtlasHostname: hostname || null } : c))
    toast.success(pid ? `Linked to ${hostname || projectId}` : 'Unlinked')
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 mb-2">
            <Shield className="w-3 h-3 mr-1.5" /> Admin
          </Badge>
          <h1 className="text-3xl font-semibold">Agency Operations</h1>
          <p className="text-sm text-muted-foreground">All clients, audits, contacts and SEO data — one view.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients ({overview.stats.users})</TabsTrigger>
          <TabsTrigger value="audits">AI Audits ({overview.stats.audits})</TabsTrigger>
          <TabsTrigger value="contacts">Leads ({overview.stats.contacts})</TabsTrigger>
          <TabsTrigger value="searchatlas">SearchAtlas</TabsTrigger>
          <TabsTrigger value="localseo">Local SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { l: 'Total clients', v: overview.stats.users, i: Users, c: 'text-blue-400' },
              { l: 'AI audits', v: overview.stats.audits, i: Sparkles, c: 'text-violet-400' },
              { l: 'Discovery leads', v: overview.stats.contacts, i: MessageSquare, c: 'text-emerald-400' },
              { l: 'Live projects', v: overview.stats.projects, i: Hammer, c: 'text-amber-400' },
              { l: 'Open tasks', v: overview.stats.tasks, i: Circle, c: 'text-rose-400' },
            ].map(x => (
              <Card key={x.l} className="bg-secondary/30 border-border/60">
                <CardContent className="p-5">
                  <x.i className={`w-5 h-5 ${x.c} mb-2`} />
                  <div className="text-3xl font-semibold">{x.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{x.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-secondary/30 border-border/60">
              <CardHeader><CardTitle>Recent clients</CardTitle><CardDescription>Latest registrations</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {overview.recentUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}{u.company ? ` · ${u.company}` : ''}</div>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'default' : 'outline'}>{u.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-border/60">
              <CardHeader><CardTitle>Recent AI audits</CardTitle><CardDescription>Lead magnet conversions</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {overview.recentAudits.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{a.website}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                    </div>
                    {typeof a.healthScore === 'number' && (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300">{a.healthScore}/100</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {saProjects[0] && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <CardTitle>SearchAtlas — Live SEO Snapshot</CardTitle>
                </div>
                <CardDescription>{saProjects[0].hostname} · {saProjects[0].trackedKeywords} tracked keywords</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Avg. position</div>
                  <div className="text-2xl font-semibold">{saProjects[0].currentAvgPosition ?? '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Search visibility</div>
                  <div className="text-2xl font-semibold">{saProjects[0].searchVisibility?.toFixed(1) ?? '—'}%</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Position 1</div>
                  <div className="text-2xl font-semibold text-emerald-400">{saProjects[0].serpsOverview?.serp_1 ?? 0}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Positions 2-10</div>
                  <div className="text-2xl font-semibold">{(saProjects[0].serpsOverview?.serp_2_3 ?? 0) + (saProjects[0].serpsOverview?.serp_4_10 ?? 0)}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader>
              <CardTitle>All clients</CardTitle>
              <CardDescription>Link each client to a SearchAtlas rank-tracker project so their portal shows their live data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {clients.map(c => (
                <div key={c.id} className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">{c.name}
                        {c.searchAtlasHostname && <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300 text-[10px]"><Globe className="w-2.5 h-2.5 mr-1" />{c.searchAtlasHostname}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.email}{c.company ? ` · ${c.company}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.role === 'admin' ? 'default' : 'outline'}>{c.role}</Badge>
                      {c.role !== 'admin' && <Button size="sm" variant="outline" onClick={() => promoteUser(c.id, 'admin')}>Make admin</Button>}
                      {c.role === 'admin' && user?.email !== c.email && <Button size="sm" variant="outline" onClick={() => promoteUser(c.id, 'client')}>Demote</Button>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Search className="w-3 h-3 text-blue-400" /> SearchAtlas project:</div>
                    <select
                      value={c.searchAtlasProjectId || ''}
                      onChange={e => {
                        const val = e.target.value
                        const p = saProjects.find(x => String(x.id) === val)
                        linkProject(c.id, val || null, p?.hostname || null)
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs flex-1 min-w-[200px]"
                    >
                      <option value="">— Not linked —</option>
                      {saProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.hostname} (#{p.id})</option>
                      ))}
                    </select>
                    {c.searchAtlasProjectId && (
                      <Button size="sm" variant="ghost" onClick={() => linkProject(c.id, null, null)} className="text-rose-400 hover:text-rose-300 h-8">
                        <X className="w-3 h-3 mr-1" />Unlink
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>AI Marketing Audits</CardTitle><CardDescription>All submissions from the homepage lead magnet</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {audits.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50 hover:border-blue-500/40 cursor-pointer" onClick={() => setSelectedAudit(a)}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.website} <span className="text-muted-foreground font-normal">· {a.industry || '—'}</span></div>
                    <div className="text-xs text-muted-foreground truncate">{a.name || '—'} &lt;{a.email}&gt;</div>
                    {a.positioning && <div className="text-xs text-muted-foreground truncate mt-1 italic">{a.positioning}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof a.healthScore === 'number' && <Badge variant="outline" className="border-blue-500/30 text-blue-300">{a.healthScore}</Badge>}
                    <Badge variant="outline">{a.status}</Badge>
                  </div>
                </div>
              ))}
              {!audits.length && <div className="text-sm text-muted-foreground p-4 text-center">No audits yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>Discovery call requests</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="p-4 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{c.name} {c.company ? <span className="text-muted-foreground font-normal">· {c.company}</span> : null}</div>
                    <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{c.email}</div>
                  <div className="text-sm">{c.message}</div>
                </div>
              ))}
              {!contacts.length && <div className="text-sm text-muted-foreground p-4 text-center">No contact submissions yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searchatlas" className="space-y-4">
          {saProjects.map(p => (
            <Card key={p.id} className="bg-secondary/30 border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> {p.hostname}</CardTitle>
                    <CardDescription>{p.trackedKeywords} tracked keywords · Updated {new Date(p.updatedAt).toLocaleDateString()}</CardDescription>
                  </div>
                  {p.publicShareHash && (
                    <a href={`https://keyword.searchatlas.com/keyword-projects/${p.publicShareHash}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Open in SearchAtlas <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Avg. position</div>
                  <div className="text-2xl font-semibold">{p.currentAvgPosition ?? '—'}</div>
                  <div className={`text-xs mt-1 ${p.positionDelta > 0 ? 'text-emerald-400' : p.positionDelta < 0 ? 'text-rose-400' : 'text-muted-foreground'}`}>Δ {p.positionDelta ?? 0}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Search visibility</div>
                  <div className="text-2xl font-semibold">{p.searchVisibility?.toFixed(1) ?? '—'}%</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Keywords ↑ / ↓</div>
                  <div className="text-2xl font-semibold">
                    <span className="text-emerald-400">{p.keywordsUpDown?.keywords_up ?? 0}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-rose-400">{p.keywordsUpDown?.keywords_down ?? 0}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Estimated daily traffic</div>
                  <div className="text-2xl font-semibold">{p.estimatedTraffic?.[0]?.traffic?.toFixed(0) ?? '—'}</div>
                </div>
                {p.serpsOverview && (
                  <div className="md:col-span-4 p-3 rounded-lg bg-background/50 border border-border/60">
                    <div className="text-xs text-muted-foreground mb-2">SERP distribution</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { l: 'Top 1', v: p.serpsOverview.serp_1, c: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                        { l: '2-3', v: p.serpsOverview.serp_2_3, c: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                        { l: '4-10', v: p.serpsOverview.serp_4_10, c: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
                        { l: '11-20', v: p.serpsOverview.serp_11_20, c: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                        { l: '21-50', v: p.serpsOverview.serp_21_50, c: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
                        { l: '51-100', v: p.serpsOverview.serp_51_100, c: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
                      ].map(s => (
                        <div key={s.l} className={`px-3 py-1.5 rounded-md border text-xs font-medium ${s.c}`}>{s.l}: {s.v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!saProjects.length && <div className="text-sm text-muted-foreground p-4 text-center">No SearchAtlas projects.</div>}
        </TabsContent>

        <TabsContent value="localseo" className="space-y-4">
          {saGbp.map(b => (
            <Card key={b.id} className="bg-secondary/30 border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> {b.name}</CardTitle>
                    <CardDescription>{b.address || 'No address set'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /><span className="text-sm font-semibold">{b.rating || '—'}</span></div>
                    <div className="text-xs text-muted-foreground">({b.reviews} reviews)</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {b.keywordBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Grid Rankings</div>
                    {b.keywordBreakdown.map((k, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/60">
                        <div className="text-sm font-medium">"{k.keyword}"</div>
                        <div className="flex items-center gap-4 text-xs">
                          <div><span className="text-muted-foreground">avg</span> <span className="font-semibold">{k.averagePosition?.toFixed(1)}</span></div>
                          <div><span className="text-muted-foreground">best</span> <span className="font-semibold text-emerald-400">#{k.bestPosition}</span></div>
                          <div><span className="text-muted-foreground">grid</span> <span className="font-semibold">{k.gridSize}×{k.gridSize}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-sm text-muted-foreground">No keyword grids configured.</div>}
              </CardContent>
            </Card>
          ))}
          {!saGbp.length && <div className="text-sm text-muted-foreground p-4 text-center">No Google Business locations connected.</div>}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Audit for {selectedAudit?.website}</DialogTitle></DialogHeader>
          {selectedAudit && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Contact:</span> {selectedAudit.name} &lt;{selectedAudit.email}&gt;</div>
              <div><span className="text-muted-foreground">Industry:</span> {selectedAudit.industry || '—'}</div>
              <div><span className="text-muted-foreground">Health score:</span> <span className="text-2xl font-semibold text-blue-400">{selectedAudit.healthScore ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Positioning:</span> {selectedAudit.positioning}</div>
              <div><span className="text-muted-foreground">Submitted:</span> {new Date(selectedAudit.createdAt).toLocaleString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------- Portal ----------
function Portal({ user, go }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [refresh, setRefresh] = useState(0)

  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    const load = async () => {
      if (!token) { go('login'); return }
      const r = await fetch('/api/portal/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setData(await r.json())
      else go('login')
    }
    load()
  }, [refresh])

  const [newProject, setNewProject] = useState({ name: '', phase: 'Plan' })
  const [newTask, setNewTask] = useState({ title: '', due: 'This week' })
  const [creating, setCreating] = useState(false)

  const createProject = async (e) => {
    e.preventDefault()
    if (!newProject.name) return
    setCreating(true)
    try {
      const r = await fetch('/api/portal/projects', { method: 'POST', headers: authHeaders, body: JSON.stringify(newProject) })
      if (!r.ok) throw new Error()
      setNewProject({ name: '', phase: 'Plan' })
      toast.success('Project created')
      setRefresh(x => x + 1)
    } catch { toast.error('Failed to create project') } finally { setCreating(false) }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!newTask.title) return
    setCreating(true)
    try {
      const r = await fetch('/api/portal/tasks', { method: 'POST', headers: authHeaders, body: JSON.stringify(newTask) })
      if (!r.ok) throw new Error()
      setNewTask({ title: '', due: 'This week' })
      toast.success('Task added')
      setRefresh(x => x + 1)
    } catch { toast.error('Failed to add task') } finally { setCreating(false) }
  }

  const toggleTask = async (t) => {
    if (!t.id) { toast.info('Sign in to persist your tasks'); return }
    await fetch(`/api/portal/tasks/${t.id}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ done: !t.done }) })
    setRefresh(x => x + 1)
  }

  const deleteTask = async (t) => {
    if (!t.id) return
    await fetch(`/api/portal/tasks/${t.id}`, { method: 'DELETE', headers: authHeaders })
    setRefresh(x => x + 1)
  }

  const deleteProject = async (p) => {
    if (!p.id) return
    await fetch(`/api/portal/projects/${p.id}`, { method: 'DELETE', headers: authHeaders })
    setRefresh(x => x + 1)
  }

  const updateProjectProgress = async (p, progress) => {
    if (!p.id) return
    await fetch(`/api/portal/projects/${p.id}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ progress }) })
    setRefresh(x => x + 1)
  }

  if (!data) return <div className="container mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-muted-foreground">Welcome back,</div>
          <h1 className="text-3xl font-semibold">{user?.name || data.user?.name || 'Client'}</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm"><Bell className="w-3.5 h-3.5 mr-1.5" />{data.notifications.length}</Button>
          <Button variant="outline" size="sm"><Mail className="w-3.5 h-3.5 mr-1.5" />Messages</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo">SEO & Rankings</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Business Health Score</CardTitle></CardHeader>
              <CardContent>
                <div className="text-6xl font-semibold text-gradient">{data.healthScore}</div>
                <Progress value={data.healthScore} className="mt-4" />
                <div className="text-xs text-muted-foreground mt-2">On track — up 6 points this month</div>
              </CardContent>
            </Card>
            {Object.entries(data.kpis).map(([k, v]) => (
              <Card key={k} className="bg-secondary/30 border-border/60">
                <CardHeader><CardTitle className="text-sm text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{v.value}</div>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${v.delta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {v.delta.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {v.delta} vs last month
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>Traffic (last 12 months)</CardTitle><CardDescription>Organic, paid and direct sessions</CardDescription></CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={data.traffic}>
                  <defs>
                    <linearGradient id="cOrganic" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="cPaid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="cDirect" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.6} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="organic" stroke="#3b82f6" fill="url(#cOrganic)" />
                  <Area type="monotone" dataKey="paid" stroke="#8b5cf6" fill="url(#cPaid)" />
                  <Area type="monotone" dataKey="direct" stroke="#10b981" fill="url(#cDirect)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-secondary/30 border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div><CardTitle>Your tasks</CardTitle><CardDescription>{data.tasks.filter(t => !t.done).length} open</CardDescription></div>
                <Button size="sm" variant="ghost" onClick={() => setTab('tasks')}>Manage <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.tasks.slice(0, 4).map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTask(t)} className={`w-5 h-5 rounded-md border-2 grid place-items-center transition ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-border/80 hover:border-blue-400'}`}>
                        {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <div className={`text-sm font-medium ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.title}</div>
                        <div className="text-xs text-muted-foreground">Due {t.due}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{t.owner}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-border/60">
              <CardHeader><CardTitle>Recent notifications</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 grid place-items-center flex-shrink-0"><Bell className="w-4 h-4 text-blue-400" /></div>
                    <div><div className="text-sm font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.time}</div></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          {data.searchAtlas && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> Live from SearchAtlas</CardTitle>
                    <CardDescription>{data.searchAtlas.hostname} · {data.searchAtlas.trackedKeywords} tracked keywords</CardDescription>
                  </div>
                  {data.searchAtlas.publicShareHash && (
                    <a href={`https://keyword.searchatlas.com/keyword-projects/${data.searchAtlas.publicShareHash}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Open full report <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Avg. position</div>
                  <div className="text-2xl font-semibold">{data.searchAtlas.avgPosition ?? '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Search visibility</div>
                  <div className="text-2xl font-semibold">{data.searchAtlas.searchVisibility?.toFixed(1) ?? '—'}%</div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Keywords ↑ / ↓</div>
                  <div className="text-2xl font-semibold">
                    <span className="text-emerald-400">{data.searchAtlas.keywordsUpDown?.keywords_up ?? 0}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-rose-400">{data.searchAtlas.keywordsUpDown?.keywords_down ?? 0}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="text-xs text-muted-foreground">Est. daily traffic</div>
                  <div className="text-2xl font-semibold">{data.searchAtlas.estimatedTraffic?.[0]?.traffic?.toFixed(0) ?? '—'}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>Keyword Rankings</CardTitle><CardDescription>SearchAtlas connected · last updated 2h ago</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.rankings.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 grid place-items-center font-semibold text-blue-400">#{k.position}</div>
                      <div className="text-sm font-medium">{k.keyword}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${k.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {k.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(k.change)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>New project</CardTitle><CardDescription>Track any workstream inside your growth OS</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={createProject} className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="Project name (e.g. Local SEO push)" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} className="flex-1" />
                <select value={newProject.phase} onChange={e => setNewProject({ ...newProject, phase: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Plan</option><option>Build</option><option>Grow</option>
                </select>
                <Button disabled={creating} type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500">Add project</Button>
              </form>
            </CardContent>
          </Card>

          {data.projects.map((p, i) => (
            <Card key={p.id || i} className="bg-secondary/30 border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg grid place-items-center ${p.phase === 'Plan' ? 'bg-blue-500/10 text-blue-400' : p.phase === 'Build' ? 'bg-violet-500/10 text-violet-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {p.phase === 'Plan' ? <Compass className="w-4 h-4" /> : p.phase === 'Build' ? <Hammer className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Phase: {p.phase} · {p.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">{p.progress}%</div>
                    {p.id && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => updateProjectProgress(p, Math.min(100, (p.progress || 0) + 10))}>+10%</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteProject(p)} className="text-rose-400 hover:text-rose-300">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Progress value={p.progress} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>Add a task</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createTask} className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="What needs doing?" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="flex-1" />
                <Input placeholder="Due" value={newTask.due} onChange={e => setNewTask({ ...newTask, due: e.target.value })} className="sm:w-40" />
                <Button disabled={creating} type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500">Add task</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-4 space-y-2">
              {data.tasks.length === 0 && <div className="text-sm text-muted-foreground p-4 text-center">No tasks yet — add your first above.</div>}
              {data.tasks.map((t, i) => (
                <div key={t.id || i} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTask(t)} className={`w-5 h-5 rounded-md border-2 grid place-items-center transition ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-border/80 hover:border-blue-400'}`}>
                      {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div>
                      <div className={`text-sm font-medium ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.title}</div>
                      <div className="text-xs text-muted-foreground">Due {t.due}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t.owner}</Badge>
                    {t.id && (
                      <Button size="sm" variant="ghost" onClick={() => deleteTask(t)} className="text-rose-400 hover:text-rose-300">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>Monthly Reports</CardTitle><CardDescription>Auto-generated on the 1st of each month</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {['June 2025','May 2025','April 2025','March 2025'].map(m => (
                <div key={m} className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <div><div className="text-sm font-medium">Growth Report — {m}</div><div className="text-xs text-muted-foreground">SEO · Traffic · Conversions · Revenue</div></div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------- Root App ----------
function App() {
  const [route, go] = useRoute()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' && localStorage.getItem('bm_token')
    if (!t) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null).then(d => d?.user && setUser(d.user)).catch(() => {})
  }, [])

  const logout = () => { localStorage.removeItem('bm_token'); setUser(null); go('home') }

  const view = (() => {
    switch (route) {
      case 'approach': return <Approach go={go} />
      case 'services': return <ServicesOverview go={go} />
      case 'plan': return <PhasePage phase="plan" go={go} />
      case 'build': return <PhasePage phase="build" go={go} />
      case 'grow': return <PhasePage phase="grow" go={go} />
      case 'connected': return <ConnectedPage go={go} />
      case 'learning': return <Learning go={go} />
      case 'pricing': return <Pricing go={go} />
      case 'contact': return <Contact go={go} />
      case 'login': return <Auth mode="login" setUser={setUser} go={go} />
      case 'register': return <Auth mode="register" setUser={setUser} go={go} />
      case 'portal': return user ? (user.role === 'admin' ? <AdminPortal user={user} go={go} /> : <Portal user={user} go={go} />) : <Auth mode="login" setUser={setUser} go={go} />
      default: return <Home go={go} />
    }
  })()

  return (
    <div className="min-h-screen flex flex-col">
      <Nav go={go} route={route} user={user} onLogout={logout} />
      <main className="flex-1">{view}</main>
      <Footer go={go} />
    </div>
  )
}

export default App
