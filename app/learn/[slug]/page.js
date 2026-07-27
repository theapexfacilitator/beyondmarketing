'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Sparkles, ArrowLeft, Clock, Calendar, ExternalLink, FileText,
  Loader2, ArrowRight, Link2, Menu, X
} from 'lucide-react'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | notfound
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog/posts/${slug}`)
      .then(async r => {
        if (r.status === 404) { setStatus('notfound'); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setData(d)
        setStatus('ok')
      })
      .catch(() => setStatus('notfound'))
  }, [slug])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Beyond Marketing</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/#home" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/#approach" className="text-muted-foreground hover:text-foreground">Our Approach</Link>
            <Link href="/#learning" className="text-foreground font-medium">Learning Hub</Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/#contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/#contact" className="hidden md:inline-flex">
              <Button size="sm" className="bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">Book Discovery Call</Button>
            </Link>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3 text-sm">
              <Link href="/#home">Home</Link>
              <Link href="/#approach">Our Approach</Link>
              <Link href="/#learning" className="font-medium">Learning Hub</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#contact">Contact</Link>
            </div>
          </div>
        )}
      </header>

      {status === 'loading' && (
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
          Loading article...
        </div>
      )}

      {status === 'notfound' && (
        <div className="container mx-auto px-4 py-24 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-3xl font-semibold">Article not found</h1>
          <p className="text-muted-foreground mt-3">The post you&apos;re looking for may have been unpublished or moved.</p>
          <Link href="/#learning">
            <Button className="mt-6"><ArrowLeft className="w-4 h-4 mr-2" />Back to Learning Hub</Button>
          </Link>
        </div>
      )}

      {status === 'ok' && data && (
        <>
          {/* Hero */}
          <section className="relative">
            {data.post.coverImage && (
              <div className="relative h-[42vh] md:h-[52vh] w-full overflow-hidden">
                <img src={data.post.coverImage} alt={data.post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>
            )}
            <div className={`container mx-auto px-4 ${data.post.coverImage ? '-mt-32 relative z-10' : 'pt-16'} pb-8`}>
              <Link href="/#learning" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-3.5 h-3.5" />
                Learning Hub
              </Link>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-300">{data.post.category}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{data.post.readingTime} min read</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(data.post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] max-w-4xl">{data.post.title}</h1>
              {data.post.excerpt && <p className="mt-5 text-lg text-muted-foreground max-w-3xl leading-relaxed">{data.post.excerpt}</p>}
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center text-white text-xs font-semibold">
                  {(data.post.author || 'BM').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-foreground font-medium">{data.post.author}</div>
                  <div className="text-xs">Beyond Marketing</div>
                </div>
              </div>
            </div>
          </section>

          {/* Body + resources */}
          <section className="container mx-auto px-4 pb-16 grid lg:grid-cols-[1fr,320px] gap-10">
            <article className="prose prose-invert prose-blue max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h3:text-xl prose-h3:mt-8 prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground prose-blockquote:border-l-blue-500/50 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:text-blue-300 prose-code:bg-secondary/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary/60 prose-pre:border prose-pre:border-border/60 prose-img:rounded-xl prose-img:border prose-img:border-border/60">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.post.body || '_No content yet._'}
              </ReactMarkdown>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24 self-start">
              {data.post.resources && data.post.resources.length > 0 && (
                <Card className="bg-secondary/30 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4 text-blue-400" />Resources</CardTitle>
                    <CardDescription>Referenced links & downloads</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.post.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border/40 hover:border-blue-500/40 hover:bg-blue-500/5 transition group text-sm">
                        <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span className="flex-1 group-hover:text-foreground">{r.label || r.url}</span>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {data.post.tags && data.post.tags.length > 0 && (
                <Card className="bg-secondary/30 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {data.post.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground border border-border/40">#{t}</span>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Need help implementing this?</CardTitle>
                  <CardDescription>Book a discovery call with our team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/#contact">
                    <Button size="sm" className="w-full bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90">
                      Book Discovery Call <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </section>

          {/* Related */}
          {data.related && data.related.length > 0 && (
            <section className="container mx-auto px-4 pb-24 border-t border-border/60 pt-16">
              <div className="text-sm text-blue-400 font-medium mb-2">Keep reading</div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">Related articles</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {data.related.map(p => (
                  <Link key={p.id} href={`/learn/${p.slug}`} className="group">
                    <Card className="bg-secondary/30 border-border/60 hover:border-blue-500/40 transition h-full overflow-hidden">
                      <div className="aspect-video overflow-hidden bg-secondary">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-blue-500/10 to-violet-500/5">
                            <FileText className="w-8 h-8 text-blue-400/30" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <Badge variant="outline" className="w-fit border-blue-500/30 bg-blue-500/5 text-blue-300 text-[10px]">{p.category}</Badge>
                        <CardTitle className="text-base mt-1">{p.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">{p.excerpt}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Beyond Marketing. A Business Growth Operating System.
      </footer>
    </div>
  )
}
