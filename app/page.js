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
            <div className="border-t border-border/50 mt-2 pt-2">
              {user ? (
                <>
                  <button onClick={() => { go('portal'); setOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" /> Client Portal
                  </button>
                  <button onClick={() => { onLogout(); setOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <button onClick={() => { go('login'); setOpen(false) }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary flex items-center gap-2 font-medium">
                  <LogOut className="w-4 h-4 rotate-180" /> Sign in to Client Portal
                </button>
              )}
            </div>
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
    {
      n: 'Starter',
      price: '$750',
      p: 'month',
      tag: 'Local businesses',
      desc: 'Brick-and-mortar & local service areas',
      features: [
        'Local SEO fundamentals',
        'Google Business Profile setup & optimisation',
        'Citation management',
        'Local keyword tracking',
        'Monthly performance report',
      ],
    },
    {
      n: 'Plan',
      price: '$1,500',
      p: 'month',
      tag: 'Strategy first',
      desc: 'Understand where you are and where you\'re going',
      features: [
        'Marketing Audit',
        'Growth Strategy',
        'Brand Positioning',
        'Quarterly Reviews',
        'Reporting Dashboard',
      ],
    },
    {
      n: 'Marketing',
      price: '$2,000',
      p: 'month',
      tag: 'Full marketing implementation',
      desc: 'Marketing execution for growing businesses',
      features: [
        'Everything in Starter',
        'Full SEO (Local + Technical + AI Search)',
        'Content strategy & production',
        'Google & Meta ads management',
        'Email marketing',
        'Monthly reporting & optimisation',
      ],
    },
    {
      n: 'Build',
      price: '$4,500',
      p: 'month',
      tag: 'Most popular',
      desc: 'The full connected growth system',
      features: [
        'Everything in Marketing',
        'Connected Business Systems setup',
        'CRM + Automation',
        'Website & Landing Pages',
        'Analytics & Dashboards',
        'Workflow Automation',
      ],
      featured: true,
    },
    {
      n: 'Grow',
      price: 'Custom',
      p: '',
      tag: 'Full ecosystem',
      desc: 'Your outsourced growth department',
      features: [
        'Everything in Build',
        'Dedicated team',
        'AI insights & recommendations',
        'Full-service reporting',
        'Priority support',
        'Quarterly strategy sessions',
      ],
    },
  ]
  return (
    <div>
      <PageHeader eyebrow="Pricing" title="Simple, scalable, aligned to growth." desc="No lock-in. You own everything we build." />
      <section className="container mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {plans.map(p => (
          <Card key={p.n} className={`relative ${p.featured ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10 md:scale-[1.02]' : 'border-border/60'} bg-secondary/30`}>
            {p.featured && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-500 to-violet-500 text-white border-0 whitespace-nowrap">Most popular</Badge>}
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.tag}</div>
              <CardTitle className="text-2xl">{p.n}</CardTitle>
              {p.desc && <CardDescription className="text-xs">{p.desc}</CardDescription>}
              <div className="text-3xl font-semibold mt-2">{p.price}<span className="text-sm text-muted-foreground font-normal">{p.p ? ' / ' + p.p : ''}</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-6">
                {p.features.map(f => <li key={f} className="flex gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{f}</li>)}
              </ul>
              <Button className="w-full" variant={p.featured ? 'default' : 'outline'} onClick={() => go('contact')} size="sm">Choose {p.n}</Button>
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
function Auth({ setUser, go }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      localStorage.setItem('bm_token', data.token)
      setUser(data.user)
      toast.success('Welcome back!')
      go('portal')
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  return (
    <section className="container mx-auto px-4 py-20 max-w-md">
      <Card className="bg-secondary/30 border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl">Client Portal Sign in</CardTitle>
          <CardDescription>Access your growth dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            <div><Label>Email</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <Button disabled={loading} type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Client accounts are created by your Beyond Marketing team. Reach out if you need access.
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function OttoTab() {
  const [otto, setOtto] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null

  useEffect(() => {
    fetch('/api/searchatlas/otto', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setOtto(d.otto || [])).finally(() => setLoading(false))
  }, [])

  const totalTimeSaved = otto.reduce((s, o) => s + (o.timeSavedMinutes || 0), 0)
  const totalDeployedFixes = otto.reduce((s, o) => s + (o.afterSummary?.deployed_fixes || 0), 0)
  const avgGrade = otto.length ? Math.round(otto.reduce((s, o) => s + (o.aiGradeOverall || 0), 0) / otto.length) : 0
  const activeSites = otto.filter(o => o.autopilotActive).length

  if (loading) return <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
  if (!otto.length) return <div className="text-sm text-muted-foreground p-4 text-center">No OTTO sites connected.</div>

  const fmtMins = (m) => {
    if (!m) return '0m'
    if (m < 60) return `${m}m`
    if (m < 60 * 24) return `${Math.floor(m / 60)}h ${m % 60}m`
    const d = Math.floor(m / (60 * 24))
    const h = Math.floor((m % (60 * 24)) / 60)
    return `${d}d ${h}h`
  }

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
          <CardContent className="p-5">
            <Zap className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-3xl font-semibold">{fmtMins(totalTimeSaved)}</div>
            <div className="text-xs text-muted-foreground mt-1">Total time saved by OTTO</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-border/60">
          <CardContent className="p-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-3xl font-semibold">{totalDeployedFixes}</div>
            <div className="text-xs text-muted-foreground mt-1">Auto-deployed fixes</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-border/60">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-violet-400 mb-2" />
            <div className="text-3xl font-semibold">{avgGrade}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg. AI Grade</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-border/60">
          <CardContent className="p-5">
            <Cpu className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-3xl font-semibold">{activeSites}/{otto.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Autopilot active</div>
          </CardContent>
        </Card>
      </div>

      {/* OTTO sites list */}
      <div className="space-y-3">
        {otto.map(o => (
          <Card key={o.uuid} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> {o.hostname}</CardTitle>
                    {o.autopilotActive ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">
                        <Circle className="w-2 h-2 mr-1.5 fill-emerald-400 text-emerald-400 animate-pulse" /> Autopilot ON
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-300">Autopilot OFF</Badge>
                    )}
                    {o.installStatus === 'success' && (
                      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300 text-[10px]">
                        {o.installLabel}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {o.cms ? `${o.cms.charAt(0).toUpperCase() + o.cms.slice(1)} · ` : ''}
                    Last analysis {o.lastAnalysis ? new Date(o.lastAnalysis).toLocaleDateString() : '—'}
                    {o.connected?.is_gsc_connected && ' · GSC ✓'}
                    {o.connected?.is_gbp_connected && ' · GBP ✓'}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-gradient">{o.aiGradeOverall}</div>
                  <div className="text-xs text-muted-foreground">AI Grade</div>
                  {o.aiGradeDelta !== 0 && (
                    <div className={`text-xs mt-1 ${o.aiGradeDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {o.aiGradeDelta > 0 ? '↑' : '↓'} {Math.abs(o.aiGradeDelta)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Holistic scores */}
              {o.holisticScores && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { l: 'Technical', v: o.holisticScores.technical_score, d: o.holisticScoresDelta?.technical_score },
                    { l: 'Content', v: o.holisticScores.content_score, d: o.holisticScoresDelta?.content_score },
                    { l: 'Authority', v: o.holisticScores.authority_score, d: o.holisticScoresDelta?.authority_score },
                    { l: 'UX Signal', v: o.holisticScores.ux_signal_score, d: o.holisticScoresDelta?.ux_signal_score },
                  ].map(s => (
                    <div key={s.l} className="p-3 rounded-lg border border-border/60 bg-background/50">
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-semibold">{s.v ?? '—'}</div>
                        {s.d !== undefined && s.d !== 0 && (
                          <div className={`text-xs ${s.d > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{s.d > 0 ? '+' : ''}{s.d}</div>
                        )}
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${s.v || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Site summary */}
              {o.afterSummary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { l: 'SEO Score', v: o.afterSummary.seo_optimization_score, c: 'text-blue-400' },
                    { l: 'Pages', v: o.afterSummary.total_pages, c: '' },
                    { l: 'Healthy', v: o.afterSummary.healthy_pages, c: 'text-emerald-400' },
                    { l: 'Issues found', v: o.afterSummary.found_issues, c: 'text-amber-400' },
                    { l: 'Fixes deployed', v: o.afterSummary.deployed_fixes, c: 'text-violet-400' },
                  ].map(s => (
                    <div key={s.l} className="text-center p-2 rounded-lg border border-border/60 bg-background/50">
                      <div className={`text-xl font-semibold ${s.c}`}>{s.v ?? '—'}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-400" /> {fmtMins(o.timeSavedMinutes)} saved</span>
                  {o.pagesWithIssues > 0 && <span>· {o.pagesWithIssues} pages with issues</span>}
                  {o.nextAnalysisAt && <span>· Next crawl {new Date(o.nextAnalysisAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(o)}>Install code</Button>
                  <a href={`https://dashboard.searchatlas.com/otto-page-v2/${o.uuid}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">Open in OTTO <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>OTTO install code for {selected?.hostname}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Standard install</div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60 font-mono text-xs break-all">{selected.pixelHtml}</div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(selected.pixelHtml || ''); toast.success('Copied to clipboard') }}>Copy</Button>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Google Tag Manager</div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/60 font-mono text-xs break-all">{selected.pixelHtmlGtm}</div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(selected.pixelHtmlGtm || ''); toast.success('Copied to clipboard') }}>Copy</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingsTab({ user }) {
  const [me, setMe] = useState(null)
  const [newKey, setNewKey] = useState({ label: '', key: '' })
  const [adding, setAdding] = useState(false)
  const [testing, setTesting] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const reload = async () => {
    const r = await fetch('/api/admin/settings', { headers: h })
    if (r.ok) setMe(await r.json())
  }
  useEffect(() => { reload() }, [])

  const addKey = async (e) => {
    e.preventDefault()
    if (!newKey.label || !newKey.key) return toast.error('Label and key required')
    setAdding(true)
    const r = await fetch('/api/admin/settings/keys', { method: 'POST', headers: h, body: JSON.stringify(newKey) })
    const d = await r.json()
    setAdding(false)
    if (r.ok) {
      toast.success(`Added "${d.added.label}" — ${d.projectCount} projects visible`)
      setNewKey({ label: '', key: '' })
      reload()
    } else toast.error(d.error || 'Failed')
  }

  const removeKey = async (id) => {
    if (!confirm('Remove this SearchAtlas account?')) return
    await fetch(`/api/admin/settings/keys/${id}`, { method: 'DELETE', headers: h })
    toast.success('Account removed')
    reload()
  }

  const renameKey = async (id, newLabel) => {
    await fetch(`/api/admin/settings/keys/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ label: newLabel }) })
    reload()
  }

  if (!me) return <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="bg-secondary/30 border-border/60 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="w-4 h-4 text-blue-400" /> SearchAtlas Accounts</CardTitle>
          <CardDescription>Connect multiple SearchAtlas accounts. Data from ALL connected accounts will appear in your dashboards, OTTO snapshots, and white-label reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {me.searchAtlasApiKeys.length > 0 && (
            <div className="space-y-2">
              {me.searchAtlasApiKeys.map(k => (
                <div key={k.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex-1 min-w-0">
                    <input
                      defaultValue={k.label}
                      onBlur={(e) => e.target.value !== k.label && renameKey(k.id, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1 w-full max-w-xs"
                    />
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{k.keyMasked}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeKey(k.id)} className="text-rose-400 hover:text-rose-300">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <form onSubmit={addKey} className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Add another account</div>
            <div>
              <Label className="text-xs">Account label</Label>
              <Input value={newKey.label} onChange={e => setNewKey({ ...newKey, label: e.target.value })} placeholder="e.g. Wildcard, Client account, Personal" />
            </div>
            <div>
              <Label className="text-xs">SearchAtlas API key</Label>
              <Input type="password" value={newKey.key} onChange={e => setNewKey({ ...newKey, key: e.target.value })} placeholder="sa_gAAAA…" className="font-mono text-xs" />
              <div className="text-[11px] text-muted-foreground mt-1">Get from SearchAtlas → Settings → API. We&apos;ll validate it before saving.</div>
            </div>
            <Button type="submit" disabled={adding || !newKey.label || !newKey.key} className="bg-gradient-to-br from-blue-500 to-violet-500">
              {adding ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Validating &amp; saving…</> : <>Add SearchAtlas account</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 border-border/60 h-fit">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-violet-400" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {me.name}</div>
          <div><span className="text-muted-foreground">Email:</span> {me.email}</div>
          <div><span className="text-muted-foreground">Company:</span> {me.company || '—'}</div>
          <div><span className="text-muted-foreground">Role:</span> <Badge className="ml-1">admin</Badge></div>
          <div><span className="text-muted-foreground">Connected accounts:</span> <Badge variant="outline" className="ml-1">{me.searchAtlasApiKeys.length}</Badge></div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContentGenius() {
  const [form, setForm] = useState({ keyword: '', targetAudience: '', tone: 'professional and confident', wordCount: 1500, businessContext: '' })
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState(null)
  const [saved, setSaved] = useState([])
  const [openBriefId, setOpenBriefId] = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const loadSaved = async () => {
    const r = await fetch('/api/content-genius/briefs', { headers: h })
    if (r.ok) setSaved((await r.json()).briefs || [])
  }
  useEffect(() => { loadSaved() }, [])

  const generate = async (e) => {
    e.preventDefault()
    if (!form.keyword) { toast.error('Enter a target keyword'); return }
    setLoading(true); setBrief(null)
    try {
      const r = await fetch('/api/content-genius/generate', { method: 'POST', headers: h, body: JSON.stringify(form) })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      setBrief(data.brief); setOpenBriefId(data.id)
      toast.success('Content brief generated ✨')
      loadSaved()
    } catch (err) { toast.error(err.message || 'Something went wrong') }
    finally { setLoading(false) }
  }

  const openBrief = async (id) => {
    const r = await fetch(`/api/content-genius/briefs/${id}`, { headers: h })
    if (r.ok) { const d = await r.json(); setBrief(d.brief); setOpenBriefId(id) }
  }

  const deleteBrief = async (id) => {
    await fetch(`/api/content-genius/briefs/${id}`, { method: 'DELETE', headers: h })
    if (openBriefId === id) { setBrief(null); setOpenBriefId(null) }
    loadSaved()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="bg-secondary/30 border-border/60 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PenTool className="w-4 h-4 text-violet-400" /> Content Genius</CardTitle>
          <CardDescription>Generate SEO-optimised content briefs using your SearchAtlas keyword data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generate} className="grid gap-3">
            <div>
              <Label className="text-xs">Target keyword *</Label>
              <Input value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })} placeholder="connected business systems" />
            </div>
            <div>
              <Label className="text-xs">Target audience</Label>
              <Input value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} placeholder="SMB founders" />
            </div>
            <div>
              <Label className="text-xs">Tone</Label>
              <Input value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Word count</Label>
              <Input type="number" min="500" max="5000" step="100" value={form.wordCount} onChange={e => setForm({ ...form, wordCount: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Business context</Label>
              <Textarea rows={3} value={form.businessContext} onChange={e => setForm({ ...form, businessContext: e.target.value })} placeholder="Beyond Marketing builds..." />
            </div>
            <Button disabled={loading} type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <>Generate brief <Sparkles className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          {saved.length > 0 && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Saved briefs</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {saved.map(b => (
                  <div key={b.id} className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between hover:border-blue-500/40 ${openBriefId === b.id ? 'border-blue-500/40 bg-blue-500/5' : 'border-border/60 bg-background/50'}`}>
                    <div className="min-w-0 flex-1" onClick={() => openBrief(b.id)}>
                      <div className="font-medium truncate">{b.title || b.keyword}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteBrief(b.id)} className="text-rose-400 hover:text-rose-300 h-6 px-2">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        {!brief ? (
          <Card className="bg-secondary/30 border-border/60 h-full">
            <CardContent className="p-12 text-center h-full flex flex-col items-center justify-center">
              <PenTool className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <div className="text-lg font-semibold">Your brief will appear here</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-sm">Enter a target keyword on the left. If the client has a linked SearchAtlas project, we'll use their live keyword data to enrich the brief.</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-violet-500/30 bg-violet-500/5 text-violet-300 mb-2">
                <Sparkles className="w-3 h-3 mr-1.5" /> {brief.searchIntent} · {brief.wordCount} words
              </Badge>
              <CardTitle className="text-2xl">{brief.title}</CardTitle>
              <CardDescription className="text-base italic">Target: {brief.targetKeyword}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Meta title</div>
                <div className="p-3 rounded-lg border border-border/60 bg-background/50 text-sm">{brief.metaTitle}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Meta description</div>
                <div className="p-3 rounded-lg border border-border/60 bg-background/50 text-sm">{brief.metaDescription}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Secondary keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {brief.secondaryKeywords?.map((k, i) => <Badge key={i} variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300">{k}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Outline</div>
                <div className="space-y-2">
                  {brief.outline?.map((s, i) => (
                    <div key={i} className={`p-3 rounded-lg border border-border/60 bg-background/50 ${s.level === 'H3' ? 'ml-6' : ''}`}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">{s.level}</Badge>
                        <div className="font-medium text-sm">{s.heading}</div>
                      </div>
                      {s.notes && <div className="text-xs text-muted-foreground mt-1">{s.notes}</div>}
                      {s.keywords?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {s.keywords.map((k, j) => <span key={j} className="text-[10px] text-blue-300">#{k}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Opening hooks</div>
                  <ul className="space-y-1.5">
                    {brief.hooks?.map((h, i) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />{h}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">CTA</div>
                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-200">{brief.cta}</div>
                </div>
              </div>
              {brief.faqs?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Suggested FAQs</div>
                  <div className="space-y-2">
                    {brief.faqs.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/60 bg-background/50">
                        <div className="text-sm font-medium">{f.q}</div>
                        <div className="text-xs text-muted-foreground mt-1">{f.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Internal link ideas</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {brief.internalLinkIdeas?.map((l, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />{l}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Authority sources to reference</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {brief.externalAuthorityLinks?.map((l, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />{l}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ---------- Admin Portal (Functional CRM) ----------
const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'qualified', label: 'Qualified', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { value: 'won', label: 'Won', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'lost', label: 'Lost', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
]

function StatusPill({ value, onChange }) {
  const s = LEAD_STATUSES.find(x => x.value === value) || LEAD_STATUSES[0]
  return (
    <select value={value || 'new'} onChange={e => onChange(e.target.value)}
      className={`h-7 rounded-md border px-2 text-xs font-medium ${s.color}`}>
      {LEAD_STATUSES.map(x => <option key={x.value} value={x.value} className="bg-background text-foreground">{x.label}</option>)}
    </select>
  )
}

function AdminPortal({ user, go }) {
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [clients, setClients] = useState([])
  const [audits, setAudits] = useState([])
  const [contacts, setContacts] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [saProjects, setSaProjects] = useState([])
  const [refresh, setRefresh] = useState(0)

  const [editClient, setEditClient] = useState(null) // client being edited (or {} for new)
  const [viewAudit, setViewAudit] = useState(null)
  const [viewLead, setViewLead] = useState(null)
  const [newProject, setNewProject] = useState({ userId: '', name: '', phase: 'Plan' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('bm_token') : null
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    const load = async () => {
      const [ov, cl, au, co, ap, sap] = await Promise.all([
        fetch('/api/admin/overview', { headers: h }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/clients', { headers: h }).then(r => r.ok ? r.json() : { clients: [] }),
        fetch('/api/admin/audits', { headers: h }).then(r => r.ok ? r.json() : { audits: [] }),
        fetch('/api/admin/contacts', { headers: h }).then(r => r.ok ? r.json() : { contacts: [] }),
        fetch('/api/admin/all-projects', { headers: h }).then(r => r.ok ? r.json() : { projects: [] }),
        fetch('/api/searchatlas/projects', { headers: h }).then(r => r.ok ? r.json() : { projects: [] }),
      ])
      setOverview(ov)
      setClients(cl.clients || [])
      setAudits(au.audits || [])
      setContacts(co.contacts || [])
      setAllProjects(ap.projects || [])
      setSaProjects(sap.projects || [])
    }
    load()
  }, [refresh])

  if (!overview) return <div className="container mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>

  // ===== Client actions =====
  const saveClient = async (data) => {
    const isNew = !data.id
    const url = isNew ? '/api/admin/clients' : `/api/admin/clients/${data.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const body = { ...data }
    if (!isNew) delete body.id
    const r = await fetch(url, { method, headers: h, body: JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed'); return false }
    if (isNew && d.tempPassword) {
      toast.success(`Client created. Temp password: ${d.tempPassword}`, { duration: 15000 })
    } else {
      toast.success(isNew ? 'Client created' : 'Client updated')
    }
    setEditClient(null)
    setRefresh(x => x + 1)
    return true
  }

  const deleteClient = async (c) => {
    if (!confirm(`Delete ${c.name} (${c.email}) and all their projects/tasks? This cannot be undone.`)) return
    const r = await fetch(`/api/admin/clients/${c.id}`, { method: 'DELETE', headers: h })
    if (r.ok) { toast.success('Client deleted'); setRefresh(x => x + 1) }
    else { const d = await r.json(); toast.error(d.error || 'Failed') }
  }

  // ===== Audit actions =====
  const updateAudit = async (id, patch) => {
    await fetch(`/api/admin/audits/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify(patch) })
    setAudits(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
    if (viewAudit?.id === id) setViewAudit({ ...viewAudit, ...patch })
  }
  const deleteAudit = async (id) => {
    if (!confirm('Delete this audit?')) return
    await fetch(`/api/admin/audits/${id}`, { method: 'DELETE', headers: h })
    setAudits(prev => prev.filter(a => a.id !== id))
    setViewAudit(null)
    toast.success('Audit deleted')
  }

  // ===== Contact actions =====
  const updateContact = async (id, patch) => {
    await fetch(`/api/admin/contacts/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify(patch) })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    if (viewLead?.id === id) setViewLead({ ...viewLead, ...patch })
  }
  const deleteContact = async (id) => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE', headers: h })
    setContacts(prev => prev.filter(c => c.id !== id))
    setViewLead(null)
    toast.success('Lead deleted')
  }

  // ===== Project actions =====
  const createProject = async (e) => {
    e.preventDefault()
    if (!newProject.userId || !newProject.name) return toast.error('Client & name required')
    const r = await fetch('/api/admin/all-projects', { method: 'POST', headers: h, body: JSON.stringify(newProject) })
    if (r.ok) { toast.success('Project created'); setNewProject({ userId: '', name: '', phase: 'Plan' }); setRefresh(x => x + 1) }
  }
  const updateProject = async (id, patch) => {
    await fetch(`/api/admin/all-projects/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify(patch) })
    setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }
  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/all-projects/${id}`, { method: 'DELETE', headers: h })
    setAllProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted')
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 mb-2">
            <Shield className="w-3 h-3 mr-1.5" /> Admin — {user?.email}
          </Badge>
          <h1 className="text-3xl font-semibold">Agency CRM</h1>
          <p className="text-sm text-muted-foreground">Manage clients, leads, audits and projects.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditClient({})} className="bg-gradient-to-br from-blue-500 to-violet-500">
            <Users className="w-4 h-4 mr-1.5" /> New client
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({contacts.length})</TabsTrigger>
          <TabsTrigger value="audits">Audits ({audits.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({allProjects.length})</TabsTrigger>
          <TabsTrigger value="content"><PenTool className="w-3 h-3 mr-1" />Content Genius</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { l: 'Clients', v: clients.length, i: Users, c: 'text-blue-400' },
              { l: 'AI audits', v: audits.length, i: Sparkles, c: 'text-violet-400' },
              { l: 'Leads', v: contacts.length, i: MessageSquare, c: 'text-emerald-400' },
              { l: 'Projects', v: allProjects.length, i: Hammer, c: 'text-amber-400' },
              { l: 'New leads', v: contacts.filter(c => (c.leadStatus || 'new') === 'new').length + audits.filter(a => (a.leadStatus || 'new') === 'new').length, i: Bell, c: 'text-rose-400' },
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Recent clients</CardTitle></div>
                <Button size="sm" variant="ghost" onClick={() => setTab('clients')}>View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {clients.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/50">
                    <div><div className="text-sm font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}{u.company ? ` · ${u.company}` : ''}</div></div>
                    <Badge variant={u.role === 'admin' ? 'default' : 'outline'}>{u.role}</Badge>
                  </div>
                ))}
                {!clients.length && <div className="text-sm text-muted-foreground p-4 text-center">No clients yet.</div>}
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Recent leads</CardTitle></div>
                <Button size="sm" variant="ghost" onClick={() => setTab('leads')}>View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {contacts.slice(0, 5).map(c => (
                  <div key={c.id} className="p-3 rounded-lg border border-border/60 bg-background/50 cursor-pointer hover:border-blue-500/40" onClick={() => setViewLead(c)}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{c.name} <span className="text-muted-foreground font-normal">· {c.email}</span></div>
                      <Badge variant="outline" className={LEAD_STATUSES.find(s => s.value === (c.leadStatus || 'new'))?.color}>{(c.leadStatus || 'new')}</Badge>
                    </div>
                    {c.message && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.message}</div>}
                  </div>
                ))}
                {!contacts.length && <div className="text-sm text-muted-foreground p-4 text-center">No leads yet.</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-3">
          {clients.map(c => (
            <Card key={c.id} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold">{c.name}</div>
                      <Badge variant={c.role === 'admin' ? 'default' : 'outline'} className="text-[10px]">{c.role}</Badge>
                      {c.status && c.status !== 'active' && <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">{c.status}</Badge>}
                      {c.searchAtlasHostname && <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-300"><Globe className="w-2.5 h-2.5 mr-1" />{c.searchAtlasHostname}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.email}
                      {c.company && <span> · {c.company}</span>}
                      {c.phone && <span> · {c.phone}</span>}
                      {c.website && <span> · {c.website}</span>}
                    </div>
                    {c.notes && <div className="text-xs text-muted-foreground mt-2 p-2 rounded-md bg-background/50 border border-border/60 italic">{c.notes}</div>}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setEditClient(c)}>Edit</Button>
                    {c.searchAtlasProjectId && saProjects.find(p => p.id === c.searchAtlasProjectId)?.publicShareHash && (
                      <Button size="sm" variant="ghost" onClick={() => {
                        const p = saProjects.find(p => p.id === c.searchAtlasProjectId)
                        navigator.clipboard.writeText(`${window.location.origin}/report/${p.publicShareHash}`)
                        toast.success('Report link copied')
                      }}><Shield className="w-3.5 h-3.5 mr-1" />Report link</Button>
                    )}
                    {c.email !== user?.email && (
                      <Button size="sm" variant="ghost" onClick={() => deleteClient(c)} className="text-rose-400 hover:text-rose-300">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!clients.length && <div className="text-sm text-muted-foreground p-8 text-center">No clients yet. Click "New client" to add one.</div>}
        </TabsContent>

        <TabsContent value="leads" className="space-y-3">
          {contacts.map(c => (
            <Card key={c.id} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewLead(c)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold">{c.name}</div>
                      {c.company && <span className="text-xs text-muted-foreground">· {c.company}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{c.email} · {new Date(c.createdAt).toLocaleDateString()}</div>
                    {c.message && <div className="text-sm mt-2 line-clamp-2">{c.message}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill value={c.leadStatus || 'new'} onChange={v => updateContact(c.id, { leadStatus: v })} />
                    <Button size="sm" variant="ghost" onClick={() => setViewLead(c)}>Open</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteContact(c.id)} className="text-rose-400 hover:text-rose-300"><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!contacts.length && <div className="text-sm text-muted-foreground p-8 text-center">No leads yet.</div>}
        </TabsContent>

        <TabsContent value="audits" className="space-y-3">
          {audits.map(a => (
            <Card key={a.id} className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewAudit(a)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold">{a.website}</div>
                      {typeof a.healthScore === 'number' && <Badge variant="outline" className="border-blue-500/30 text-blue-300">{a.healthScore}/100</Badge>}
                      {a.industry && <span className="text-xs text-muted-foreground">· {a.industry}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{a.name || '—'} &lt;{a.email}&gt; · {new Date(a.createdAt).toLocaleDateString()}</div>
                    {a.positioning && <div className="text-xs text-muted-foreground italic mt-2 line-clamp-2">{a.positioning}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill value={a.leadStatus || 'new'} onChange={v => updateAudit(a.id, { leadStatus: v })} />
                    <Button size="sm" variant="ghost" onClick={() => setViewAudit(a)}>Open</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAudit(a.id)} className="text-rose-400 hover:text-rose-300"><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!audits.length && <div className="text-sm text-muted-foreground p-8 text-center">No audits yet.</div>}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="bg-secondary/30 border-border/60">
            <CardHeader><CardTitle>New project</CardTitle><CardDescription>Assign a project to any client</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={createProject} className="grid md:grid-cols-4 gap-2">
                <select value={newProject.userId} onChange={e => setNewProject({ ...newProject, userId: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">— Select client —</option>
                  {clients.filter(c => c.role === 'client').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                <Input placeholder="Project name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} className="md:col-span-2" />
                <select value={newProject.phase} onChange={e => setNewProject({ ...newProject, phase: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Plan</option><option>Build</option><option>Grow</option>
                </select>
                <Button type="submit" className="bg-gradient-to-br from-blue-500 to-violet-500 md:col-span-4">Add project</Button>
              </form>
            </CardContent>
          </Card>

          {allProjects.map(p => (
            <Card key={p.id} className="bg-secondary/30 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {p.name}
                      <Badge variant="outline" className="text-[10px]">{p.phase}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.client ? `${p.client.name}${p.client.company ? ' · ' + p.client.company : ''}` : 'Unassigned'} · {p.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{p.progress}%</div>
                    <Button size="sm" variant="ghost" onClick={() => updateProject(p.id, { progress: Math.min(100, (p.progress || 0) + 10) })}>+10%</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateProject(p.id, { progress: Math.max(0, (p.progress || 0) - 10) })}>−10%</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProject(p.id)} className="text-rose-400 hover:text-rose-300"><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <Progress value={p.progress} />
              </CardContent>
            </Card>
          ))}
          {!allProjects.length && <div className="text-sm text-muted-foreground p-8 text-center">No projects yet.</div>}
        </TabsContent>

        <TabsContent value="content"><ContentGenius /></TabsContent>

        <TabsContent value="settings"><SettingsTab user={user} /></TabsContent>
      </Tabs>

      {/* Client edit/create modal */}
      <ClientEditorDialog
        client={editClient}
        onClose={() => setEditClient(null)}
        onSave={saveClient}
        saProjects={saProjects}
      />

      {/* Audit detail modal */}
      <Dialog open={!!viewAudit} onOpenChange={(o) => !o && setViewAudit(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Audit: {viewAudit?.website}</DialogTitle></DialogHeader>
          {viewAudit && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Contact</span><div>{viewAudit.name} &lt;{viewAudit.email}&gt;</div></div>
                <div><span className="text-muted-foreground text-xs">Industry</span><div>{viewAudit.industry || '—'}</div></div>
                <div><span className="text-muted-foreground text-xs">Health score</span><div className="text-2xl font-semibold text-blue-400">{viewAudit.healthScore ?? '—'}</div></div>
                <div><span className="text-muted-foreground text-xs">Submitted</span><div>{new Date(viewAudit.createdAt).toLocaleString()}</div></div>
              </div>
              {viewAudit.positioning && (
                <div><span className="text-muted-foreground text-xs">Positioning</span><div className="italic mt-1">{viewAudit.positioning}</div></div>
              )}
              <Separator />
              <div>
                <Label className="text-xs">Lead status</Label>
                <div className="mt-1"><StatusPill value={viewAudit.leadStatus || 'new'} onChange={v => updateAudit(viewAudit.id, { leadStatus: v })} /></div>
              </div>
              <div>
                <Label className="text-xs">Admin notes</Label>
                <Textarea rows={4} value={viewAudit.adminNotes || ''} onChange={e => setViewAudit({ ...viewAudit, adminNotes: e.target.value })}
                  onBlur={e => updateAudit(viewAudit.id, { adminNotes: e.target.value })}
                  placeholder="Add follow-up notes, next action, deal size…" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => deleteAudit(viewAudit.id)} className="text-rose-400">Delete audit</Button>
                <Button size="sm" onClick={() => setViewAudit(null)}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lead detail modal */}
      <Dialog open={!!viewLead} onOpenChange={(o) => !o && setViewLead(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Lead: {viewLead?.name}</DialogTitle></DialogHeader>
          {viewLead && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Email</span><div>{viewLead.email}</div></div>
                <div><span className="text-muted-foreground text-xs">Company</span><div>{viewLead.company || '—'}</div></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs">Submitted</span><div>{new Date(viewLead.createdAt).toLocaleString()}</div></div>
              </div>
              {viewLead.message && (
                <div>
                  <span className="text-muted-foreground text-xs">Message</span>
                  <div className="mt-1 p-3 rounded-md border border-border/60 bg-background/50 whitespace-pre-wrap">{viewLead.message}</div>
                </div>
              )}
              <Separator />
              <div>
                <Label className="text-xs">Lead status</Label>
                <div className="mt-1"><StatusPill value={viewLead.leadStatus || 'new'} onChange={v => updateContact(viewLead.id, { leadStatus: v })} /></div>
              </div>
              <div>
                <Label className="text-xs">Admin notes</Label>
                <Textarea rows={4} value={viewLead.adminNotes || ''} onChange={e => setViewLead({ ...viewLead, adminNotes: e.target.value })}
                  onBlur={e => updateContact(viewLead.id, { adminNotes: e.target.value })}
                  placeholder="Add follow-up notes, next action…" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => deleteContact(viewLead.id)} className="text-rose-400">Delete lead</Button>
                <div className="flex gap-2">
                  <a href={`mailto:${viewLead.email}`}><Button size="sm" variant="outline">Email <Mail className="w-3.5 h-3.5 ml-1.5" /></Button></a>
                  <Button size="sm" onClick={() => setViewLead(null)}>Done</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClientEditorDialog({ client, onClose, onSave, saProjects }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', website: '', notes: '', role: 'client', status: 'active', password: '', searchAtlasProjectId: '', searchAtlasHostname: '' })
  const [saving, setSaving] = useState(false)
  const isNew = client && !client.id

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        email: client.email || '',
        company: client.company || '',
        phone: client.phone || '',
        website: client.website || '',
        notes: client.notes || '',
        role: client.role || 'client',
        status: client.status || 'active',
        password: '',
        searchAtlasProjectId: client.searchAtlasProjectId || '',
        searchAtlasHostname: client.searchAtlasHostname || '',
      })
    }
  }, [client?.id, client === null])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, id: client?.id }
    // Convert SA project id to number if present
    if (payload.searchAtlasProjectId) {
      const p = saProjects.find(x => String(x.id) === String(payload.searchAtlasProjectId))
      payload.searchAtlasProjectId = Number(payload.searchAtlasProjectId)
      payload.searchAtlasHostname = p?.hostname || payload.searchAtlasHostname
    } else {
      payload.searchAtlasProjectId = null
      payload.searchAtlasHostname = null
    }
    if (!payload.password) delete payload.password
    await onSave(payload)
    setSaving(false)
  }

  return (
    <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? 'New client' : `Edit ${client?.name}`}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Email *</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!isNew} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="example.com" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Role</Label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="client">client</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>active</option><option>onboarding</option><option>paused</option><option>churned</option>
              </select>
            </div>
          </div>
          {isNew && (
            <div><Label className="text-xs">Password (leave blank to auto-generate)</Label><Input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Auto-generated if blank" /></div>
          )}
          <div>
            <Label className="text-xs">SearchAtlas project (for reporting)</Label>
            <select value={form.searchAtlasProjectId || ''} onChange={e => setForm({ ...form, searchAtlasProjectId: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Not linked —</option>
              {saProjects.map(p => <option key={p.id} value={p.id}>{p.hostname} (#{p.id})</option>)}
            </select>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Anything the team should know…" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-br from-blue-500 to-violet-500">
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isNew ? 'Create client' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
          {data.otto && (
            <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" /> OTTO — AI SEO Autopilot
                      {data.otto.autopilotActive && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">
                          <Circle className="w-2 h-2 mr-1.5 fill-emerald-400 text-emerald-400 animate-pulse" /> Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{data.otto.hostname} · {data.otto.cms ? data.otto.cms.charAt(0).toUpperCase() + data.otto.cms.slice(1) + ' · ' : ''}Last analysis {data.otto.lastAnalysis ? new Date(data.otto.lastAnalysis).toLocaleDateString() : '—'}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-semibold text-gradient">{data.otto.aiGradeOverall}</div>
                    <div className="text-xs text-muted-foreground">AI Grade</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400" /> Time saved by OTTO</div>
                    <div className="text-2xl font-semibold mt-1">
                      {(() => {
                        const m = data.otto.timeSavedMinutes || 0
                        if (m < 60) return `${m}m`
                        if (m < 1440) return `${Math.floor(m/60)}h ${m%60}m`
                        return `${Math.floor(m/1440)}d ${Math.floor((m%1440)/60)}h`
                      })()}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                    <div className="text-xs text-muted-foreground">Auto-deployed fixes</div>
                    <div className="text-2xl font-semibold mt-1 text-violet-400">{data.otto.afterSummary?.deployed_fixes ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                    <div className="text-xs text-muted-foreground">SEO Score</div>
                    <div className="text-2xl font-semibold mt-1 text-blue-400">{data.otto.afterSummary?.seo_optimization_score ?? '—'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                    <div className="text-xs text-muted-foreground">Healthy pages</div>
                    <div className="text-2xl font-semibold mt-1 text-emerald-400">{data.otto.afterSummary?.healthy_pages ?? '—'}<span className="text-sm text-muted-foreground font-normal">/{data.otto.afterSummary?.total_pages ?? '—'}</span></div>
                  </div>
                </div>

                {data.otto.holisticScores && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { l: 'Technical', v: data.otto.holisticScores.technical_score, d: data.otto.holisticScoresDelta?.technical_score },
                      { l: 'Content', v: data.otto.holisticScores.content_score, d: data.otto.holisticScoresDelta?.content_score },
                      { l: 'Authority', v: data.otto.holisticScores.authority_score, d: data.otto.holisticScoresDelta?.authority_score },
                      { l: 'UX Signal', v: data.otto.holisticScores.ux_signal_score, d: data.otto.holisticScoresDelta?.ux_signal_score },
                    ].map(s => (
                      <div key={s.l} className="p-3 rounded-lg border border-border/60 bg-background/40">
                        <div className="text-xs text-muted-foreground">{s.l}</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl font-semibold">{s.v ?? '—'}</div>
                          {s.d !== undefined && s.d !== 0 && (
                            <div className={`text-xs ${s.d > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{s.d > 0 ? '+' : ''}{s.d}</div>
                          )}
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${s.v || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <div>
                    {data.otto.pagesWithIssues > 0 && <span>{data.otto.pagesWithIssues} pages with active issues · </span>}
                    {data.otto.nextAnalysisAt && <span>Next automated crawl {new Date(data.otto.nextAnalysisAt).toLocaleDateString()}</span>}
                  </div>
                  <div className="italic">OTTO deploys fixes automatically. You don't need to lift a finger.</div>
                </div>
              </CardContent>
            </Card>
          )}

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
      case 'login': return <Auth setUser={setUser} go={go} />
      case 'portal': return user ? (user.role === 'admin' ? <AdminPortal user={user} go={go} /> : <Portal user={user} go={go} />) : <Auth setUser={setUser} go={go} />
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
