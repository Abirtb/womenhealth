import { useCallback, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'

/** Default map point (seed data in backend is near SF). */
export const DEMO_LOCATION = {
  lat: 37.7749,
  lng: -122.4194,
  label: 'Demo area — set your location for real distances',
}

/**
 * Resolves where to search for ingredients: browser override → profile → demo.
 */
export function useShoppingLocation() {
  const user = useAuthStore((s) => s.user)
  const [browserOverride, setBrowserOverride] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle')

  const fromProfile = useMemo(() => {
    if (user?.location_lat == null || user?.location_lng == null) return null
    const lat = Number(user.location_lat)
    const lng = Number(user.location_lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return {
      lat,
      lng,
      label: user.city ? `Saved · ${user.city}` : 'Saved in your profile',
    }
  }, [user?.location_lat, user?.location_lng, user?.city])

  const active = browserOverride || fromProfile || DEMO_LOCATION
  const source = browserOverride ? 'browser' : fromProfile ? 'profile' : 'demo'

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserOverride({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your current location',
        })
        setGeoStatus('ok')
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
    )
  }, [])

  const clearBrowserOverride = useCallback(() => {
    setBrowserOverride(null)
    setGeoStatus('idle')
  }, [])

  return {
    lat: active.lat,
    lng: active.lng,
    label: active.label,
    source,
    geoStatus,
    requestBrowserLocation,
    clearBrowserOverride,
    hasProfileCoords: Boolean(fromProfile),
  }
}
