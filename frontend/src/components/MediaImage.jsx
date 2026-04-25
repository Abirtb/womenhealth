import { useState } from 'react'

export function MediaImage({ src, alt, className = '', imgClassName = 'h-full w-full object-cover' }) {
  const [ok, setOk] = useState(true)

  if (!ok) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-rose-100 via-sand-100 to-rose-50 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="px-4 text-center text-xs font-medium text-mauve-600">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={imgClassName}
        onError={() => setOk(false)}
      />
    </div>
  )
}
