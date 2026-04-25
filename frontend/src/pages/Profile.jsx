import { useEffect, useState } from 'react'
import { fetchProfile, updateProfile } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MediaImage } from '../components/MediaImage'
import { SectionTitle } from '../components/SectionTitle'
import { imagery } from '../content/imagery'

const stages = [
  { value: '1', label: 'First trimester' },
  { value: '2', label: 'Second trimester' },
  { value: '3', label: 'Third trimester' },
]

const field =
  'mt-1.5 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-mauve-800 shadow-inner outline-none ring-rose-200 transition focus:ring-2'

export function Profile() {
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
      .then((data) =>
        setForm({
          name: data.name,
          pregnancy_stage: data.pregnancy_stage,
          city: data.city || '',
          location_lat: data.location_lat ?? '',
          location_lng: data.location_lng ?? '',
          allergies: data.allergies || '',
          dietary_restrictions: data.dietary_restrictions || '',
        }),
      )
      .catch(() => setForm(null))
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const payload = {
        ...form,
        location_lat: form.location_lat === '' ? null : Number(form.location_lat),
        location_lng: form.location_lng === '' ? null : Number(form.location_lng),
      }
      const data = await updateProfile(payload)
      setUser(data)
      setMessage('Saved softly — your profile is updated.')
    } catch {
      setError('Could not save changes.')
    }
  }

  if (!form) {
    return (
      <div className="flex items-center gap-2 text-sm text-mauve-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
        Loading your profile…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white/95 shadow-xl shadow-rose-100/50">
        <div className="relative h-44 sm:h-52">
          <MediaImage
            src={imagery.hydration}
            alt="Refreshing drink with citrus"
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/70 via-mauve-900/25 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200">Profile</p>
            <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">Your gentle settings</h1>
          </div>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <SectionTitle
            eyebrow="Your story"
            title="Keep details feeling light"
            subtitle="Update your stage, sensitivities, and optional map coordinates. Everything saves with one tap."
          />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[1.75rem] border border-rose-100/90 bg-white/95 p-6 shadow-xl shadow-rose-100/40 sm:p-8"
      >
        <label className="block text-sm font-medium text-mauve-800">
          Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
        </label>
        <label className="block text-sm font-medium text-mauve-800">
          Pregnancy stage
          <select
            value={form.pregnancy_stage}
            onChange={(e) => setForm({ ...form, pregnancy_stage: e.target.value })}
            className={field}
          >
            {stages.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-mauve-800">
          City
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={field} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-mauve-800">
            Latitude
            <input
              value={form.location_lat}
              onChange={(e) => setForm({ ...form, location_lat: e.target.value })}
              className={field}
              placeholder="optional"
            />
          </label>
          <label className="block text-sm font-medium text-mauve-800">
            Longitude
            <input
              value={form.location_lng}
              onChange={(e) => setForm({ ...form, location_lng: e.target.value })}
              className={field}
              placeholder="optional"
            />
          </label>
        </div>
        <p className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-mauve-600">
          Saving a home pin helps the <span className="font-semibold text-mauve-800">Ingredients</span> page show the{' '}
          <span className="font-semibold">closest</span> shops and stock for your meals. You can also use “current
          location” on that page once.
        </p>
        <label className="block text-sm font-medium text-mauve-800">
          Allergies
          <textarea
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            rows={3}
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-mauve-800">
          Dietary restrictions
          <textarea
            value={form.dietary_restrictions}
            onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })}
            rows={3}
            className={field}
          />
        </label>
        {message && <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
        {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/70 transition hover:from-rose-400 hover:to-rose-300"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}
