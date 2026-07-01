import { useEffect, useState } from 'react'
import { btnGhost, btnPrimary, btnSecondary, cardPad, sectionHeading } from '../styles/ui'

const priorityStyles = {
  high: 'border-warm/40 bg-warm-soft',
  medium: 'border-border bg-canvas',
  low: 'border-border bg-surface',
}

function OptimizationSuggestions({ suggestions = [], loading }) {
  const [hiddenIds, setHiddenIds] = useState(() => new Set())
  const [applyingId, setApplyingId] = useState(null)

  useEffect(() => {
    setHiddenIds(new Set())
    setApplyingId(null)
  }, [suggestions])

  const visible = suggestions.filter((s) => !hiddenIds.has(s.id))

  function handleDismiss(id) {
    setHiddenIds((prev) => new Set([...prev, id]))
  }

  function handleApply(id) {
    setApplyingId(id)
    setTimeout(() => {
      setApplyingId(null)
      setHiddenIds((prev) => new Set([...prev, id]))
    }, 700)
  }

  if (loading) {
    return (
      <section className={cardPad}>
        <h2 className={sectionHeading}>Optimization suggestions</h2>
        <p className="mt-4 text-sm text-muted">Loading suggestions…</p>
      </section>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <section className={cardPad}>
      <div className="mb-4">
        <h2 className={sectionHeading}>Optimization suggestions</h2>
        <p className="mt-1 text-sm text-muted">
          One-click actions from the agent — apply or dismiss each recommendation.
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">All suggestions handled. The agent will surface new ones as data updates.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((s) => (
            <li
              key={s.id}
              className={`rounded-lg border px-4 py-4 ${priorityStyles[s.priority] ?? priorityStyles.low}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink">{s.campaignName}</span>
                {s.priority === 'high' && (
                  <span className="rounded-full bg-warm px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                    Needs review
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">{s.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApply(s.id)}
                  disabled={applyingId === s.id}
                  className={`${btnPrimary} px-4 py-2 text-xs`}
                >
                  {applyingId === s.id ? 'Applying…' : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDismiss(s.id)}
                  disabled={applyingId === s.id}
                  className={`${btnSecondary} px-4 py-2 text-xs`}
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default OptimizationSuggestions
