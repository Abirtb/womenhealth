export function SectionTitle({ eyebrow, title, subtitle, align = 'left' }) {
  const a = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-3xl space-y-2 ${a}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-semibold leading-tight text-mauve-800 md:text-4xl">{title}</h2>
      {subtitle && <p className="text-base text-mauve-700 md:text-lg">{subtitle}</p>}
    </div>
  )
}
