import { Heart, LayoutDashboard, Leaf, LogOut, MapPin, Menu, Sparkles, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navClass = ({ isActive }) =>
  `rounded-2xl px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-white text-rose-600 shadow-md shadow-rose-100/80 ring-1 ring-rose-100/80'
      : 'text-mauve-700 hover:bg-white/70'
  }`

function initials(name, email) {
  const n = (name || email || '?').trim()
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return n.slice(0, 2).toUpperCase()
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const links = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/diet', label: 'Diet plan', icon: Sparkles },
    { to: '/nearby', label: 'Ingredients', icon: MapPin },
    { to: '/profile', label: 'Profile', icon: UserRound },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-rose-100/70 bg-white/80 shadow-sm shadow-rose-100/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="group flex items-center gap-3 font-semibold text-rose-600">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-200 via-rose-100 to-sand-100 text-rose-600 shadow-inner ring-2 ring-white">
              <Heart className="h-5 w-5 transition group-hover:scale-105" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg text-mauve-800">Nurtura</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-rose-400">Nutrition</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/advice" className={navClass}>
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4" aria-hidden />
                Advice
              </span>
            </NavLink>
            {user &&
              links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </span>
                </NavLink>
              ))}
            {!user && (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-2xl px-4 py-2 text-sm font-medium text-mauve-700 hover:bg-white/80"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-200/80 transition hover:from-rose-400 hover:to-rose-300"
                >
                  Join free
                </Link>
              </div>
            )}
            {user && (
              <div className="ml-3 flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/60 py-1 pl-1 pr-3 sm:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-rose-600 shadow-sm">
                    {initials(user.name, user.email)}
                  </span>
                  <div className="leading-tight">
                    <p className="max-w-[9rem] truncate text-xs font-semibold text-mauve-800">{user.name}</p>
                    <p className="text-[10px] text-mauve-600">Signed in</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white px-3 py-2 text-sm font-medium text-mauve-700 shadow-sm transition hover:border-rose-200 hover:shadow-md"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            )}
          </nav>

          <button
            type="button"
            className="inline-flex rounded-2xl border border-rose-100 bg-white p-2 text-mauve-800 shadow-sm md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-rose-100 bg-white/98 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <NavLink to="/advice" className={navClass} onClick={() => setOpen(false)}>
                Advice
              </NavLink>
              {user ? (
                links.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navClass} onClick={() => setOpen(false)}>
                    {label}
                  </NavLink>
                ))
              ) : (
                <>
                  <Link to="/login" className="rounded-2xl px-4 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-rose-500 px-4 py-2 text-center text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Join free
                  </Link>
                </>
              )}
              {user && (
                <button type="button" className="rounded-2xl px-4 py-2 text-left text-sm" onClick={handleLogout}>
                  Log out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-rose-100/80 bg-white/70 py-8 text-sm text-mauve-600 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-mauve-800">Nurtura</p>
            <p className="mt-1 max-w-md text-mauve-600">
              Built for calm browsing — not a substitute for your midwife or doctor. Always follow personalized medical
              advice.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-mauve-700">
            <Link to="/advice" className="hover:text-rose-600">
              Pregnancy tips
            </Link>
            <Link to="/register" className="hover:text-rose-600">
              Create account
            </Link>
            <Link to="/login" className="hover:text-rose-600">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
