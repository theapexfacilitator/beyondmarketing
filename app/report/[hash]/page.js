'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Globe, TrendingUp, Search, BarChart3, Zap, Shield, CheckCircle2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function ReportPage() {
  const params = useParams()
  const hash = params?.hash
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!hash) return
    fetch(`/api/report/${hash}`)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Report not found')
        return r.json()
      })
      .then(d => setData(d.report))
      .catch(e => setErr(e.message))
  }, [hash])

  if (err) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">Report unavailable</div>
        <div className="text-sm text-muted-foreground">{err}</div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )

  const m = data.metrics
  const svDelta = (m.searchVisibility ?? 0) - (m.searchVisibilityPrev ?? 0)
  const visSeries = (data.visibilityHistory || []).slice(-30).map((v, i) => ({ i, sv: v.sv, date: v.date }))
  const trafficSeries = (data.trafficHistory || []).slice(-30).map((v, i) => ({ i, traffic: v.traffic, date: v.date }))

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Branded header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Beyond Marketing</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Growth Report</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Report generated {new Date(data.generatedAt).toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero */}
        <section className="mb-10">
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300 mb-4">
            <Globe className="w-3 h-3 mr-1.5" /> {data.hostname}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {data.client?.company || data.client?.name || data.hostname}
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">Monthly growth report · SEO performance · {new Date(data.updatedAt).toLocaleDateString()}</p>
        </section>

        {/* KPI Row */}
        <section className="grid md:grid-cols-4 gap-4 mb-10">
          <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Search Visibility</div>
              <div className="text-4xl font-semibold mt-2">{m.searchVisibility?.toFixed(1) ?? '—'}%</div>
              <div className={`text-xs mt-2 flex items-center gap-1 ${svDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {svDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {svDelta.toFixed(2)}pp vs previous
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Avg. Position</div>
              <div className="text-4xl font-semibold mt-2">{m.avgPosition ?? '—'}</div>
              <div className={`text-xs mt-2 flex items-center gap-1 ${(m.positionDelta ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(m.positionDelta ?? 0) > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                Δ {m.positionDelta ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Tracked Keywords</div>
              <div className="text-4xl font-semibold mt-2">{m.trackedKeywords}</div>
              <div className="text-xs mt-2 text-muted-foreground">
                <span className="text-emerald-400">↑ {data.keywordsUpDown?.keywords_up ?? 0}</span>
                <span className="mx-2">·</span>
                <span className="text-rose-400">↓ {data.keywordsUpDown?.keywords_down ?? 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Est. Daily Traffic</div>
              <div className="text-4xl font-semibold mt-2">{m.estimatedDailyTraffic?.toFixed(0) ?? '—'}</div>
              <div className="text-xs mt-2 text-muted-foreground">from organic search</div>
            </CardContent>
          </Card>
        </section>

        {/* Search Visibility Chart */}
        {visSeries.length > 0 && (
          <Card className="bg-secondary/30 border-border/60 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> Search Visibility Trend</CardTitle>
              <CardDescription>Overall visibility across all tracked keywords</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={visSeries}>
                  <defs>
                    <linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={v => v ? new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="sv" name="Visibility %" stroke="#3b82f6" fill="url(#sv)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* SERP Distribution */}
        {data.serpsOverview && (
          <Card className="bg-secondary/30 border-border/60 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="w-4 h-4 text-blue-400" /> SERP Distribution</CardTitle>
              <CardDescription>Where your keywords currently rank in search results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { l: 'Position 1', v: data.serpsOverview.serp_1, c: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300' },
                  { l: 'Positions 2-3', v: data.serpsOverview.serp_2_3, c: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-300' },
                  { l: 'Positions 4-10', v: data.serpsOverview.serp_4_10, c: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-300' },
                  { l: 'Positions 11-20', v: data.serpsOverview.serp_11_20, c: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300' },
                  { l: 'Positions 21-50', v: data.serpsOverview.serp_21_50, c: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-300' },
                  { l: 'Positions 51-100', v: data.serpsOverview.serp_51_100, c: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-300' },
                ].map(s => (
                  <div key={s.l} className={`p-4 rounded-xl border bg-gradient-to-br ${s.c}`}>
                    <div className="text-2xl font-semibold">{s.v}</div>
                    <div className="text-xs mt-1 opacity-80">{s.l}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Traffic Trend */}
        {trafficSeries.length > 0 && (
          <Card className="bg-secondary/30 border-border/60 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-400" /> Estimated Traffic Trend</CardTitle>
              <CardDescription>Daily organic traffic estimate</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={trafficSeries}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={v => v ? new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
                  <Line type="monotone" dataKey="traffic" name="Est. traffic" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Separator className="my-10" />

        {/* CTA */}
        <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-background p-8 md:p-12 text-center relative overflow-hidden">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Want to see this data every month — automatically?</h2>
            <p className="mt-3 text-muted-foreground">Beyond Marketing builds connected growth systems so you always know what's working.</p>
            <div className="mt-6 flex justify-center gap-3">
              <a href="/#contact"><Button size="lg" className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">Book a Discovery Call <ArrowUpRight className="w-4 h-4 ml-2" /></Button></a>
              <a href="/"><Button size="lg" variant="outline">Visit Beyond Marketing</Button></a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-3 h-3" />
            You own your data · Live SEO data from SearchAtlas · Report powered by Beyond Marketing
          </div>
          <div>© {new Date().getFullYear()} Beyond Marketing. All data belongs to {data.client?.company || data.hostname}.</div>
        </footer>
      </main>
    </div>
  )
}
