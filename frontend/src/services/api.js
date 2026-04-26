import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const rawBase = import.meta.env.VITE_API_BASE_URL || ''
export const api = axios.create({
  baseURL: rawBase ? `${rawBase.replace(/\/$/, '')}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const apiRoot = rawBase ? `${rawBase.replace(/\/$/, '')}/api` : '/api'

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = useAuthStore.getState().refresh
      if (refresh) {
        try {
          const { data } = await axios.post(`${apiRoot}/auth/refresh/`, { refresh })
          useAuthStore.setState({ access: data.access })
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          useAuthStore.getState().logout()
        }
      }
    }
    return Promise.reject(error)
  },
)

export async function register(payload) {
  const { data } = await api.post('/auth/register/', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login/', payload)
  return data
}

export async function fetchProfile() {
  const { data } = await api.get('/profile/')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/profile/', payload)
  return data
}

export async function fetchFoods() {
  const { data } = await api.get('/foods/')
  return data
}

export async function fetchDietPlans() {
  const { data } = await api.get('/diet-plan/')
  return data
}

export async function generateDiet(week_number = 1) {
  const { data } = await api.post('/generate-diet/', { week_number })
  return data
}

export async function fetchNearbyFood(params) {
  const { data } = await api.get('/nearby-food/', { params })
  return data
}

export async function fetchFoodByLocation(params) {
  const { data } = await api.get('/food-by-location/', { params })
  return data
}

export async function fetchArticles(params) {
  const { data } = await api.get('/articles/', { params })
  return data
}

export async function verifyProductBlockchain(productId) {
  const { data } = await api.get(`/blockchain/verify/${productId}/`)
  return data
}

