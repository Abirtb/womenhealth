import { ExternalLink, List, MapPin, MapPinned, Navigation, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchNearbyFood, updateProfile, verifyProductBlockchain } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MediaImage } from '../components/MediaImage'
import { SectionTitle } from '../components/SectionTitle'
import { BlockchainVerificationBadge } from '../components/BlockchainVerificationBadge'
import { BlockchainVerificationModal } from '../components/BlockchainVerificationModal'
import { foodImageForCategory, imagery } from '../content/imagery'
import { useShoppingLocation } from '../hooks/useShoppingLocation'

function groupByShop(rows) {
  const map = new Map()
  for (const row of rows) {
    const id = row.seller.id
    if (!map.has(id)) {
      map.set(id, {
        seller: row.seller,
        items: [],
        minKm: row.distance_km,
      })
    }
    const g = map.get(id)
    g.items.push(row)
    g.minKm = Math.min(g.minKm, row.distance_km)
  }
  return [...map.values()].sort((a, b) => a.minKm - b.minKm)
}

export function NearbyFood() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)
  const {
    lat,
    lng,
    label,
    source,
    geoStatus,
    requestBrowserLocation,
    clearBrowserOverride,
    hasProfileCoords,
  } = useShoppingLocation()

  const [mode, setMode] = useState('list')
  const [organic, setOrganic] = useState(false)
  const [minSafety, setMinSafety] = useState(80)
  const [radius, setRadius] = useState(30)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingLoc, setSavingLoc] = useState(false)
  
  // Blockchain verification state
  const [blockchainData, setBlockchainData] = useState({})
  const [blockchainLoading, setBlockchainLoading] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showBlockchainModal, setShowBlockchainModal] = useState(false)

  const params = useMemo(
    () => ({
      lat,
      lng,
      radius_km: radius,
      min_safety: minSafety,
      ...(organic ? { organic: true } : {}),
    }),
    [lat, lng, radius, minSafety, organic],
  )

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchNearbyFood(params)
        if (active) setItems(data)
      } catch {
        if (active) {
          setError('Unable to load nearby ingredients.')
          setItems([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [params])

  const shops = useMemo(() => groupByShop(items), [items])

  const saveCurrentLocationToProfile = async () => {
    if (!user || source !== 'browser') return
    setSavingLoc(true)
    try {
      const data = await updateProfile({
        location_lat: lat,
        location_lng: lng,
      })
      setUser(data)
      clearBrowserOverride()
    } catch {
      setError('Could not save location to your profile.')
    } finally {
      setSavingLoc(false)
    }
  }

  const fetchBlockchainVerification = async (productId, itemName) => {
    if (blockchainData[productId]) {
      setSelectedProduct({ productId, itemName, data: blockchainData[productId] })
      setShowBlockchainModal(true)
      return
    }

    setBlockchainLoading((prev) => ({ ...prev, [productId]: true }))
    try {
      const data = await verifyProductBlockchain(productId)
      setBlockchainData((prev) => ({ ...prev, [productId]: data }))
      setSelectedProduct({ productId, itemName, data })
      setShowBlockchainModal(true)
    } catch (err) {
      console.error('Failed to fetch blockchain verification:', err)
      setError('Could not load blockchain verification data.')
    } finally {
      setBlockchainLoading((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const getBlockchainProductId = (name) => {
    // Convert product name to lowercase for blockchain matching
    // e.g., "Spinach" -> "spinach", "Wild salmon" -> "wild salmon"
    return name.toLowerCase()
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/95 shadow-lg shadow-rose-100/40">
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          <div className="p-8 sm:p-10">
            <SectionTitle
              eyebrow="Shop smarter"
              title="Find ingredients at the closest places"
              subtitle="We sort sellers and products by distance from your point — use your real location or coordinates saved in Profile so “closest” matches your life, not a demo map."
            />
          </div>
          <div className="relative min-h-[200px]">
            <MediaImage
              src={imagery.market}
              alt="Local market for fresh ingredients"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent lg:from-white/90" />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-white to-sand-50/80 p-5 shadow-md sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Navigation className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Search from</p>
              <p className="font-medium text-mauve-800">{label}</p>
              <p className="text-xs text-mauve-600">
                {lat.toFixed(4)}, {lng.toFixed(4)} ·{' '}
                {source === 'browser' && 'Phone / browser location'}
                {source === 'profile' && 'Your saved profile pin'}
                {source === 'demo' && 'Demo until you set a pin'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestBrowserLocation}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/60 hover:bg-rose-400 disabled:opacity-50"
              disabled={geoStatus === 'loading'}
            >
              <MapPin className="h-4 w-4" aria-hidden />
              {geoStatus === 'loading' ? 'Locating…' : 'Use my current location'}
            </button>
            {hasProfileCoords && source === 'browser' && (
              <button
                type="button"
                onClick={clearBrowserOverride}
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-mauve-800 shadow-sm hover:bg-rose-50"
              >
                Use saved profile pin
              </button>
            )}
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-mauve-800 shadow-sm hover:bg-rose-50"
            >
              Set location in Profile
            </Link>
            {user && source === 'browser' && (
              <button
                type="button"
                onClick={saveCurrentLocationToProfile}
                disabled={savingLoc}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
              >
                {savingLoc ? 'Saving…' : 'Save this location to profile'}
              </button>
            )}
          </div>
        </div>
        {geoStatus === 'denied' && (
          <p className="text-sm text-amber-800">Location access was blocked — add coordinates in Profile or use the demo point.</p>
        )}
        {geoStatus === 'unsupported' && (
          <p className="text-sm text-mauve-600">This browser does not support geolocation. Set latitude and longitude in Profile.</p>
        )}
        {!hasProfileCoords && source === 'demo' && (
          <p className="text-sm text-mauve-600">
            Tip: open <Link to="/profile" className="font-semibold text-rose-600">Profile</Link> and save your home pin so every visit ranks the{' '}
            <span className="font-semibold">closest</span> stores for your ingredients.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-md">
        <div className="flex rounded-2xl bg-rose-50 p-1">
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
              mode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-mauve-700'
            }`}
          >
            <List className="h-4 w-4" aria-hidden />
            By ingredient
          </button>
          <button
            type="button"
            onClick={() => setMode('shops')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
              mode === 'shops' ? 'bg-white text-rose-600 shadow-sm' : 'text-mauve-700'
            }`}
          >
            <Store className="h-4 w-4" aria-hidden />
            Closest shops
          </button>
          <button
            type="button"
            onClick={() => setMode('map')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
              mode === 'map' ? 'bg-white text-rose-600 shadow-sm' : 'text-mauve-700'
            }`}
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Map
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-mauve-800">
          <input
            type="checkbox"
            checked={organic}
            onChange={(e) => setOrganic(e.target.checked)}
            className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-200"
          />
          Organic only
        </label>
        <label className="text-sm text-mauve-800">
          Min safety
          <input
            type="range"
            min={60}
            max={100}
            value={minSafety}
            onChange={(e) => setMinSafety(Number(e.target.value))}
            className="ml-2 align-middle accent-rose-500"
          />
          <span className="ml-1 font-semibold tabular-nums">{minSafety}</span>
        </label>
        <label className="text-sm text-mauve-800">
          Radius (km)
          <input
            type="number"
            min={5}
            max={200}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="ml-2 w-20 rounded-2xl border border-rose-100 px-2 py-1.5 text-mauve-800 shadow-inner"
          />
        </label>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-mauve-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
          Finding the closest places for your ingredients…
        </p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {mode === 'shops' && (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-mauve-800">Closest one-stop shops</h3>
          {shops.length === 0 && !loading && <p className="text-sm text-mauve-600">No sellers in this radius — try widening distance.</p>}
          {shops.map((g) => {
            const loc = g.seller.location
            const mapHref = `https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=16/${loc.latitude}/${loc.longitude}`
            return (
              <div
                key={g.seller.id}
                className="overflow-hidden rounded-2xl border border-rose-100/90 bg-white/95 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-rose-50/50 px-4 py-3">
                  <div>
                    <p className="font-display text-lg text-mauve-800">{g.seller.name}</p>
                    <p className="text-sm text-mauve-600">
                      {loc.label}
                      {loc.address ? ` · ${loc.address}` : ''} · {g.minKm} km — closest in this list
                    </p>
                  </div>
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50"
                  >
                    Open in map
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </div>
                <ul className="grid gap-2 p-4 sm:grid-cols-2">
                  {g.items.map((row) => (
                    <li key={row.id} className="flex items-center gap-3 rounded-xl bg-sand-50/60 px-3 py-2 text-sm text-mauve-800">
                      <span className="font-semibold text-rose-600">{row.food_item.name}</span>
                      <span className="text-mauve-500">· {row.distance_km} km</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {mode === 'list' && (
        <div className="grid gap-5 md:grid-cols-2">
          {items.length === 0 && !loading && <p className="text-sm text-mauve-600 col-span-full">No matches — widen the radius or lower the safety filter.</p>}
          {items.map((row) => {
            const productId = getBlockchainProductId(row.food_item.name)
            const isVerified = !!blockchainData[productId]
            const isLoading = blockchainLoading[productId]

            return (
            <div
              key={row.id}
              className="overflow-hidden rounded-3xl border border-rose-100/90 bg-white/95 shadow-md shadow-rose-100/40 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9]">
                <MediaImage
                  src={foodImageForCategory(row.food_item.category)}
                  alt=""
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="absolute left-3 top-3 rounded-full bg-mauve-900/80 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-sm">
                  {row.distance_km} km
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-rose-600 shadow-md backdrop-blur-sm">
                  Safety {row.food_item.safety_score}
                </div>
                <BlockchainVerificationBadge
                  isVerified={isVerified}
                  isLoading={isLoading}
                  onClick={() => fetchBlockchainVerification(productId, row.food_item.name)}
                />
              </div>
              <div className="space-y-2 p-5">
                <p className="font-display text-xl text-mauve-800">{row.food_item.name}</p>
                <p className="text-sm text-mauve-600">
                  {row.seller.name} · {row.food_item.category}
                </p>
                <p className="text-xs text-mauve-500">
                  {row.food_item.organic ? 'Organic' : 'Conventional'} · {row.seller.location.label}
                </p>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {mode === 'map' && (
        <div className="relative h-[440px] overflow-hidden rounded-[2rem] border border-rose-100 shadow-inner">
          <MediaImage
            src={imagery.greens}
            alt=""
            className="absolute inset-0 h-full w-full opacity-40"
            imgClassName="h-full w-full object-cover blur-[1px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(244,63,94,0.2),transparent_45%),radial-gradient(circle_at_70%_55%,rgba(232,160,176,0.22),transparent_40%)]" />
          {items.map((row, idx) => {
            const left = 18 + ((idx * 23) % 58)
            const top = 22 + ((idx * 29) % 52)
            return (
              <div
                key={row.id}
                className="absolute max-w-[200px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white/95 shadow-xl shadow-rose-100/60 ring-1 ring-rose-100/80 backdrop-blur-sm"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="h-16 w-full">
                  <MediaImage
                    src={foodImageForCategory(row.food_item.category)}
                    alt=""
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
                <div className="px-3 py-2 text-xs text-mauve-800">
                  <p className="font-semibold text-rose-600">{row.food_item.name}</p>
                  <p>
                    {row.distance_km} km · {row.food_item.safety_score}
                  </p>
                </div>
              </div>
            )
          })}
          <p className="absolute bottom-4 left-4 max-w-md rounded-xl bg-white/90 px-3 py-2 text-xs text-mauve-700 shadow-md backdrop-blur-sm">
            Illustrative map — your list above is ordered by <span className="font-semibold">shortest trip</span> for each ingredient. Plug in MapLibre or Google Maps when you are ready.
          </p>
        </div>
      )}

      <BlockchainVerificationModal
        isOpen={showBlockchainModal}
        onClose={() => {
          setShowBlockchainModal(false)
          setSelectedProduct(null)
        }}
        data={selectedProduct?.data}
        productName={selectedProduct?.itemName}
      />
    </div>
  )
}
