import { MapPin, Sparkles, SunMedium } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MediaImage } from '../components/MediaImage'
import { foodImageForCategory, imagery } from '../content/imagery'
import { useShoppingLocation } from '../hooks/useShoppingLocation'
import { fetchDietPlans, fetchFoodByLocation, generateDiet } from '../services/api'
import { useAuthStore } from '../store/authStore'

const trimesterLabel = (s) =>
  ({ '1': 'First trimester', '2': 'Second trimester', '3': 'Third trimester' }[s] || 'Your journey')

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { lat, lng, label: locLabel } = useShoppingLocation()
  const [preview, setPreview] = useState([])
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const nearby = await fetchFoodByLocation({ lat, lng, radius_km: 30 })
        if (active) setPreview(nearby.slice(0, 3))
        const plans = await fetchDietPlans()
        if (active) {
          const latest = plans[0]
          if (latest?.meals?.meals?.monday) {
            setMeal(latest.meals.meals.monday)
          } else {
            setMeal(null)
          }
        }
      } catch {
        if (active) {
          setPreview([])
          setMeal(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [lat, lng])

  const quickPlan = async () => {
    await generateDiet(1)
    const plans = await fetchDietPlans()
    const latest = plans[0]
    if (latest?.meals?.meals?.monday) setMeal(latest.meals.meals.monday)
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-rose-100/90 bg-white/95 shadow-xl shadow-rose-100/50 ring-1 ring-white/70">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center gap-4 px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Your home</p>
            <h1 className="font-display text-3xl font-semibold text-mauve-800 sm:text-4xl">
              {user?.name ? `${user.name}, ` : ''}welcome back to your calm corner.
            </h1>
            <p className="max-w-xl text-mauve-700">
              Here&apos;s a snapshot of today&apos;s plate inspiration and a few trusted picks nearby — scroll down for
              the full map experience anytime.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/diet"
                className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 hover:bg-rose-400"
              >
                Open diet plan
              </Link>
              <Link
                to="/nearby"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-mauve-800 shadow-sm hover:border-rose-300"
              >
                Find ingredients near me
              </Link>
            </div>
          </div>
          <div className="relative min-h-[220px]">
            <MediaImage
              src={imagery.heroFood}
              alt="Colorful healthy meal"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent lg:from-white/90" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:left-auto sm:right-4 sm:max-w-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">Hydration</p>
              <p className="mt-1 text-sm text-mauve-700">Keep water nearby — add citrus or cucumber for a little joy.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white/95 shadow-md shadow-rose-100/40">
          <MediaImage
            src={imagery.nurserySoft}
            alt=""
            className="aspect-[16/10] w-full lg:aspect-auto lg:h-40"
            imgClassName="h-full w-full object-cover opacity-95"
          />
          <div className="space-y-3 p-6">
            <div className="flex items-center gap-3">
              <SunMedium className="h-6 w-6 text-rose-500" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mauve-600">Journey</p>
                <p className="font-display text-xl text-mauve-800">{trimesterLabel(user?.pregnancy_stage)}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-mauve-600">
              Update your stage in Profile so suggestions stay in tune with how you feel week to week.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white/95 shadow-md shadow-rose-100/40 lg:col-span-2">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="h-7 w-7 shrink-0 text-blush-500" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mauve-600">Today</p>
                <p className="font-display text-2xl text-mauve-800">Meal inspiration</p>
                <p className="mt-1 text-sm text-mauve-600">A soft template from our mock AI — yours to refine.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={quickPlan}
              className="shrink-0 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/70 hover:from-rose-400 hover:to-rose-300"
            >
              Refresh plan
            </button>
          </div>
          {loading && <p className="px-6 pb-6 text-sm text-mauve-600">Gathering your gentle suggestions…</p>}
          {!loading && meal && (
            <ul className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
              {Object.entries(meal).map(([key, val]) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-2xl border border-rose-100/80 bg-rose-50/50 p-3 text-sm text-mauve-800"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-white shadow-sm">
                    <MediaImage
                      src={foodImageForCategory(key === 'breakfast' ? 'fruit' : key === 'lunch' ? 'vegetable' : 'protein')}
                      alt=""
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">{key}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && !meal && (
            <p className="px-6 pb-6 text-sm text-mauve-600">
              No plan yet — visit{' '}
              <Link to="/diet" className="font-semibold text-rose-600 hover:text-rose-500">
                Diet plan
              </Link>{' '}
              or tap refresh to generate a mock week.
            </p>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/95 shadow-lg shadow-rose-100/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-rose-500" aria-hidden />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mauve-600">Ingredients</p>
              <p className="font-display text-xl text-mauve-800">Closest places for these foods</p>
              <p className="text-xs text-mauve-500">{locLabel}</p>
            </div>
          </div>
          <Link to="/nearby" className="text-sm font-semibold text-rose-600 hover:text-rose-500">
            Where to shop →
          </Link>
        </div>
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[240px]">
            <MediaImage
              src={imagery.market}
              alt="Farmers market produce"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/55 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 flex h-3 w-3 rounded-full bg-rose-500 shadow-lg ring-4 ring-white/90" />
            <div className="absolute left-[48%] top-[42%] flex h-3 w-3 rounded-full bg-blush-500 shadow-lg ring-4 ring-white/90" />
            <div className="absolute bottom-5 right-6 flex h-2.5 w-2.5 rounded-full bg-white shadow ring-2 ring-rose-200" />
            <p className="absolute bottom-4 left-4 max-w-xs rounded-xl bg-white/90 px-3 py-2 text-xs text-mauve-700 shadow-md backdrop-blur-sm">
              Pins are illustrative — the nearby page adds filters for organic and safety.
            </p>
          </div>
          <div className="space-y-3 p-6">
            {preview.length === 0 && (
              <p className="text-sm text-mauve-600">No listings in range — widen filters on the nearby page.</p>
            )}
            {preview.map((row) => (
              <div
                key={row.food.id}
                className="flex items-center gap-4 rounded-2xl border border-rose-100/80 bg-rose-50/40 p-3 shadow-sm"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow-md">
                  <MediaImage
                    src={foodImageForCategory(row.food.category)}
                    alt=""
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-mauve-800">{row.food.name}</p>
                  <p className="text-xs text-mauve-600">
                    {row.seller} · {row.distance_km} km · score {row.food.safety_score}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-rose-600 shadow-sm">
                  {row.food.organic ? 'Organic' : 'Classic'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
