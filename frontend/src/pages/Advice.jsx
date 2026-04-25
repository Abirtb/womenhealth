import { BookOpenCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchArticles } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MediaImage } from '../components/MediaImage'
import { SectionTitle } from '../components/SectionTitle'
import { articleCoverUrl } from '../content/imagery'

const categories = {
  nutrition: 'Nutrition',
  health: 'Health',
  pregnancy: 'Pregnancy tips',
  weekly: 'Weekly picks',
}

export function Advice() {
  const stage = useAuthStore((s) => s.user?.pregnancy_stage)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const params = stage ? { trimester: stage } : {}
        const data = await fetchArticles(params)
        if (active) setArticles(data)
      } catch {
        if (active) setArticles([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [stage])

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/95 shadow-xl shadow-rose-100/50">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
            <SectionTitle
              eyebrow="Guidance library"
              title="Stories that meet you where you are"
              subtitle="Warm photography, gentle typography, and advice filtered to your trimester when you are signed in."
            />
          </div>
          <div className="relative min-h-[220px] md:min-h-0">
            <MediaImage
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=82"
              alt="Peaceful morning light"
              className="h-full min-h-[220px] w-full md:absolute md:inset-0 md:min-h-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mauve-900/35 via-transparent to-transparent md:bg-gradient-to-l" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 text-sm text-mauve-600 shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
          Opening gentle stories…
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {articles.map((article) => {
          const expanded = openId === article.id
          return (
            <article
              key={article.id}
              className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-rose-100/90 bg-white/95 shadow-lg shadow-rose-100/40 ring-1 ring-white/60"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <MediaImage
                  src={articleCoverUrl(article.slug)}
                  alt=""
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/45 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
                  <BookOpenCheck className="h-5 w-5 shrink-0 text-rose-100" aria-hidden />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100">
                    {categories[article.category] || 'Article'}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h2 className="font-display text-2xl font-semibold text-mauve-800">{article.title}</h2>
                {article.summary && <p className="text-sm leading-relaxed text-mauve-600">{article.summary}</p>}
                <p className={`text-sm leading-relaxed text-mauve-800 ${expanded ? '' : 'line-clamp-4'}`}>{article.body}</p>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : article.id)}
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500"
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" aria-hidden />
                    </>
                  ) : (
                    <>
                      Read full article <ChevronDown className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
                {article.trimester && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-400">
                    Trimester spotlight · {article.trimester}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
