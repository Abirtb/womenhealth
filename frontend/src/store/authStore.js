import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      setSession: ({ access, refresh, user }) => set({ access, refresh, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ access: null, refresh: null, user: null }),
    }),
    { name: 'nurtura-auth' },
  ),
)
