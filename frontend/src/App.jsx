import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Advice } from './pages/Advice'
import { Dashboard } from './pages/Dashboard'
import { DietPlan } from './pages/DietPlan'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { NearbyFood } from './pages/NearbyFood'
import { Profile } from './pages/Profile'
import { Register } from './pages/Register'
import { fetchProfile } from './services/api'
import { useAuthStore } from './store/authStore'

export default function App() {
  const access = useAuthStore((s) => s.access)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    if (!access || user) return undefined
    let cancelled = false
    fetchProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
    return () => {
      cancelled = true
    }
  }, [access, user, setUser, logout])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="advice" element={<Advice />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="diet" element={<DietPlan />} />
          <Route path="nearby" element={<NearbyFood />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
