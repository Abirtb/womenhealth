import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, fetchProfile } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MediaImage } from '../components/MediaImage'
import { imagery } from '../content/imagery'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/dashboard'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokens = await login({ email: form.email, password: form.password })
      useAuthStore.setState({ access: tokens.access, refresh: tokens.refresh })
      const profile = await fetchProfile()
      setSession({ access: tokens.access, refresh: tokens.refresh, user: profile })
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Unable to login. Check your email and password.'
      setError(typeof msg === 'string' ? msg : 'Unable to login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-rose-100/90 bg-white/95 shadow-2xl shadow-rose-200/40 ring-1 ring-white/70">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[420px] lg:block">
          <MediaImage
            src={imagery.calmHands}
            alt="Hands holding a warm drink"
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/65 via-mauve-900/25 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2 text-white">
            <p className="font-display text-3xl font-semibold leading-tight">Welcome back to your calm corner.</p>
            <p className="text-sm text-rose-50/90">Pick up where you left off — meals, markets, and gentle guidance.</p>
          </div>
        </div>

        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-md space-y-2 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Welcome back</p>
            <h1 className="font-display text-3xl font-semibold text-mauve-800">Login to Nurtura</h1>
            <p className="text-sm text-mauve-600">Your soft companion for pregnancy nutrition.</p>
          </div>
          <form className="mx-auto mt-8 max-w-md space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-medium text-mauve-800">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-mauve-800 shadow-inner outline-none ring-rose-200 transition focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-mauve-800">
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-mauve-800 shadow-inner outline-none ring-rose-200 transition focus:ring-2"
              />
            </label>
            {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 transition hover:from-rose-400 hover:to-rose-300 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mx-auto mt-6 max-w-md text-center text-sm text-mauve-600 lg:text-left">
            New here?{' '}
            <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-500">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
