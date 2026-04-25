import { ArrowRight, CheckCircle2, Leaf, MapPin, Shield, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MediaImage } from '../components/MediaImage'
import { imagery } from '../content/imagery'

const perks = [
  { title: 'Trimester-aware plans', copy: 'Gentle structure that grows with you — AI-ready when you are.', img: imagery.heroFood },
  { title: 'Food you can feel good about', copy: 'Organic toggles, safety scores, and nearby sellers.', img: imagery.market },
  { title: 'Calm, not clinical', copy: 'Soft light, warm typography, and breathing room everywhere.', img: imagery.calmHands },
]

export function Landing() {
  return (
    <div className="space-y-16 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-rose-100/90 bg-white/90 shadow-2xl shadow-rose-200/40 ring-1 ring-white/60">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:py-14">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-100/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              <Sparkles className="h-4 w-4" aria-hidden />
              For expecting parents
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-mauve-800 sm:text-5xl lg:text-[3.25rem]">
              Nourishment, softness, and clarity — in one gentle app.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-mauve-700">
              Track safe foods near you, preview weekly plates, and read reassuring guidance. Designed to feel like a
              quiet nursery corner, not a hospital dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-rose-200/70 transition hover:from-rose-400 hover:to-rose-300"
              >
                Start free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/90 bg-white px-6 py-3.5 text-sm font-semibold text-mauve-800 shadow-sm transition hover:border-rose-300 hover:shadow-md"
              >
                I already have an account
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mauve-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                No clutter — essentials first
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                Photo-rich, human tone
              </span>
            </div>
          </div>
          <div className="relative min-h-[280px] lg:min-h-[420px]">
            <MediaImage
              src={imagery.heroMain}
              alt="Calm moment of self-care during pregnancy"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/55 via-mauve-900/10 to-transparent lg:bg-gradient-to-l" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-lg shadow-rose-100/60 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">Live preview</p>
              <p className="mt-1 font-display text-lg text-mauve-800">Today&apos;s plate</p>
              <p className="text-sm text-mauve-600">Colorful whole foods, hydration nudges, and nearby organic picks.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {perks.map((p) => (
          <div
            key={p.title}
            className="group overflow-hidden rounded-3xl border border-rose-100/90 bg-white/90 shadow-lg shadow-rose-100/40 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <MediaImage
              src={p.img}
              alt=""
              className="aspect-[16/10] w-full"
              imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="space-y-2 p-5">
              <p className="font-display text-xl text-mauve-800">{p.title}</p>
              <p className="text-sm leading-relaxed text-mauve-600">{p.copy}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid items-center gap-10 rounded-[2rem] border border-rose-100 bg-gradient-to-br from-white via-rose-50/50 to-sand-50 p-8 shadow-inner sm:p-10 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Why Nurtura feels different</p>
          <h2 className="font-display text-3xl font-semibold text-mauve-800 sm:text-4xl">Safety signals without the scare.</h2>
          <p className="text-mauve-700">
            We pair gentle visuals with practical filters — organic, distance, and a clear safety score — so you can
            browse markets without doom-scrolling ingredient lists alone.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-rose-100/60">
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" aria-hidden />
              <div>
                <p className="font-semibold text-mauve-800">Grounded guidance</p>
                <p className="text-sm text-mauve-600">Articles written in plain language you can share with family.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-rose-100/60">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-blush-500" aria-hidden />
              <div>
                <p className="font-semibold text-mauve-800">Nearby goodness</p>
                <p className="text-sm text-mauve-600">See what&apos;s in stock close to your saved coordinates.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-rose-100/60 sm:col-span-2">
              <Leaf className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="font-semibold text-mauve-800">Room to grow</p>
                <p className="text-sm text-mauve-600">
                  Architecture is ready for AI meal planning and traceability proofs — today you get a polished MVP with
                  photos, motion, and calm hierarchy.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-white/70">
          <MediaImage
            src={imagery.nurserySoft}
            alt="Soft nursery light and textiles"
            className="aspect-[4/5] max-h-[520px] w-full sm:aspect-auto sm:max-h-none sm:min-h-[360px]"
            imgClassName="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mauve-900/35 to-transparent" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-rose-100 bg-mauve-800 px-6 py-10 text-center text-white shadow-2xl sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">Ready when you are</p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Let&apos;s set up your gentle dashboard.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-rose-50/90">
          Two minutes to register — add allergies and trimester, peek at a mock AI week, and explore advice with rich
          photography.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-mauve-800 shadow-lg transition hover:bg-rose-50"
          >
            Create my account
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/advice" className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Browse advice first
          </Link>
        </div>
      </section>
    </div>
  )
}
