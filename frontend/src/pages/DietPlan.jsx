import { MapPin, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MediaImage } from '../components/MediaImage'
import { SectionTitle } from '../components/SectionTitle'
import { imagery } from '../content/imagery'
import { fetchDietPlans, generateDiet } from '../services/api'

export function DietPlan() {
  const [plans, setPlans] = useState([])
  const [week, setWeek] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const data = await fetchDietPlans()
    setPlans(data)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchDietPlans()
        if (!cancelled) setPlans(data)
      } catch {
        if (!cancelled) setPlans([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const runGenerate = async () => {
    setBusy(true)
    setError('')
    try {
      await generateDiet(week)
      await load()
    } catch {
      setError('Could not generate a plan right now.')
    } finally {
      setBusy(false)
    }
  }

  const latest = plans[0]

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/95 shadow-lg shadow-rose-100/50">
        <div className="grid lg:grid-cols-[1fr_0.85fr]">
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
            <SectionTitle
              eyebrow="Weekly rhythm"
              title="Your diet plan"
              subtitle="Weekly meals use your food catalog; RAG-backed recipes (when Ollama + indexes are up) appear below with ingredients matched to your list."
            />
          </div>
          <div className="relative min-h-[200px]">
            <MediaImage
              src={imagery.breakfast}
              alt="Nourishing breakfast spread"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent lg:from-white/95" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-rose-100/80 bg-white/80 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-mauve-800">
            Week #
            <input
              type="number"
              min={1}
              max={42}
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="ml-2 w-20 rounded-2xl border border-rose-100 bg-white px-3 py-2 text-mauve-800"
            />
          </label>
          <button
            type="button"
            onClick={runGenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 hover:from-rose-400 hover:to-rose-300 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {busy ? 'Generating…' : 'Generate / refresh'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 rounded-[1.75rem] border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <MapPin className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-mauve-800">Where to get these ingredients</p>
            <p className="mt-1 text-sm text-mauve-600">
              We rank local sellers and products by distance from your location (browser or profile pin). Open the
              shopping view to see the <span className="font-semibold">closest</span> one-stop markets first.
            </p>
          </div>
        </div>
        <Link
          to="/nearby"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 transition hover:bg-rose-400"
        >
          Find ingredients near me
        </Link>
      </div>

      <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-mauve-800">RAG + catalog</p>
            <p className="text-sm text-mauve-700">
              Evidence-grounded recipe ideas from `backend/rag` (FAISS + PDFs) when{' '}
              <span className="font-mono text-xs">NURTURA_USE_RAG</span> is on and Ollama is reachable. Ingredients are
              matched to your <span className="font-semibold">FoodItem</span> list when names align.
            </p>
          </div>
        </div>
      </div>

      {!latest && (
        <div className="rounded-3xl border border-rose-100 bg-white/90 p-6 text-mauve-700 shadow-md">
          No saved plan yet. Generate a gentle week to see meals appear here.
        </div>
      )}

      {latest && (
        <div className="space-y-4 rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-xl shadow-rose-100/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-mauve-700">Week {latest.week_number}</p>
              <p className="font-display text-xl font-semibold text-mauve-800">Saved plan snapshot</p>
            </div>
            <p className="text-xs text-mauve-600">Updated {new Date(latest.updated_at).toLocaleString()}</p>
          </div>
          {latest.meals?.trimester_focus && (
            <p className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-mauve-800">{latest.meals.trimester_focus}</p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {latest.meals?.meals &&
              Object.entries(latest.meals.meals).map(([day, meals]) => (
                <div key={day} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                  <p className="mb-2 font-display text-lg font-semibold capitalize text-rose-600">{day}</p>
                  <ul className="space-y-2 text-sm text-mauve-800">
                    {Object.entries(meals).map(([meal, val]) => (
                      <li key={meal}>
                        <span className="font-semibold capitalize">{meal}:</span> {val}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
          {latest.recommendations && (
            <p className="text-sm text-mauve-700">
              <span className="font-semibold text-mauve-800">Recommendations: </span>
              {latest.recommendations}
            </p>
          )}

          {latest.meals?.rag_error && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">RAG unavailable: </span>
              {latest.meals.rag_error}
              <span className="mt-1 block text-xs text-amber-800">
                Start Ollama with your model, or set <code className="rounded bg-white/80 px-1">NURTURA_USE_RAG=false</code>{' '}
                to skip retrieval recipes.
              </span>
            </p>
          )}

          {Array.isArray(latest.meals?.rag_recipes) && latest.meals.rag_recipes.length > 0 && (
            <div className="space-y-4 border-t border-rose-100 pt-6">
              <p className="font-display text-lg font-semibold text-mauve-800">RAG recipe ideas</p>
              <ul className="space-y-5">
                {latest.meals.rag_recipes.map((recipe, idx) => (
                  <li
                    key={`${recipe.name || 'recipe'}-${idx}`}
                    className="rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="font-semibold text-rose-700">{recipe.name || 'Recipe'}</p>
                    {recipe.explanation && (
                      <p className="mt-2 text-sm text-mauve-700">{recipe.explanation}</p>
                    )}
                    {Array.isArray(recipe.ingredients_linked) && recipe.ingredients_linked.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-mauve-600">Ingredients</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {recipe.ingredients_linked.map((row, j) => (
                            <li
                              key={j}
                              className={`rounded-full px-3 py-1 text-xs ${
                                row.matched_food
                                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                                  : 'border border-rose-100 bg-rose-50/60 text-mauve-700'
                              }`}
                              title={row.matched_food ? `Catalog id: ${row.matched_food.id}` : 'Not in catalog'}
                            >
                              {row.text}
                              {row.matched_food && (
                                <span className="ml-1 font-semibold">→ {row.matched_food.name}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
