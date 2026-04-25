import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MediaImage } from '../components/MediaImage'
import { imagery } from '../content/imagery'

const stages = [
  { value: '1', label: 'First trimester' },
  { value: '2', label: 'Second trimester' },
  { value: '3', label: 'Third trimester' },
]

export function Register() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    pregnancy_stage: '1',
    city: '',
    allergies: '',
    dietary_restrictions: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form)
      setSession({ access: data.access, refresh: data.refresh, user: data.user })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const body = err.response?.data
      let msg = 'Unable to register.'
      if (body && typeof body === 'object') {
        const first = Object.entries(body)[0]
        if (first) msg = `${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : first[1]}`
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-mauve-800 shadow-inner outline-none ring-rose-200 transition focus:ring-2'

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-rose-100/90 bg-white/95 shadow-2xl shadow-rose-200/40 ring-1 ring-white/70">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-xl space-y-2 text-center lg:mx-0 lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Start softly</p>
            <h1 className="font-display text-3xl font-semibold text-mauve-800">Create your Nurtura profile</h1>
            <p className="text-sm text-mauve-600">A few details help us shape gentle meals and nearby picks for you.</p>
          </div>
          <form className="mx-auto mt-8 grid max-w-xl gap-4 md:grid-cols-2 lg:mx-0" onSubmit={onSubmit}>
            <label className="md:col-span-2 block text-sm font-medium text-mauve-800">
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-mauve-800">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mauve-800">
              Password
              <input
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mauve-800">
              Pregnancy stage
              <select
                value={form.pregnancy_stage}
                onChange={(e) => setForm({ ...form, pregnancy_stage: e.target.value })}
                className={inputClass}
              >
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-mauve-800">
              City (optional)
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
            </label>
            <label className="md:col-span-2 block text-sm font-medium text-mauve-800">
              Allergies
              <textarea
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                rows={2}
                className={inputClass}
                placeholder="e.g., peanuts, shellfish"
              />
            </label>
            <label className="md:col-span-2 block text-sm font-medium text-mauve-800">
              Dietary preferences / restrictions
              <textarea
                value={form.dietary_restrictions}
                onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })}
                rows={2}
                className={inputClass}
                placeholder="vegetarian, halal, low sodium…"
              />
            </label>
            {error && <p className="md:col-span-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 transition hover:from-rose-400 hover:to-rose-300 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="mx-auto mt-6 max-w-xl text-center text-sm text-mauve-600 lg:mx-0 lg:text-left">
            Already nurturing?{' '}
            <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500">
              Login
            </Link>
          </p>
        </div>

        <div className="relative hidden min-h-[480px] lg:block">
          <MediaImage
            src={imagery.heroFruit}
            alt="Fresh fruit and gentle light"
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/60 via-mauve-900/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 space-y-3 text-white">
            <p className="font-display text-3xl font-semibold leading-tight">Your story matters here.</p>
            <p className="text-sm text-rose-50/90">
              Photos, soft gradients, and breathing room — because wellness apps should feel like a hug, not a chart.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
