import IndexMetricCard from './IndexMetricCard'
import { btnPrimary, btnSecondary, card, sectionHeading } from '../styles/ui'

function ImpactStoryPanel({
  impactStory,
  campaignName,
  loading,
  error,
  showRebalanceAction = false,
  rebalancePreviewActive = false,
  onToggleRebalancePreview,
}) {
  if (loading) {
    return (
      <section className={`${card} p-6`}>
        <h2 className={sectionHeading}>Impact story</h2>
        <p className="mt-4 text-sm text-muted">Loading indexed summary…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`${card} border-danger/30 bg-danger-soft p-6`}>
        <p className="text-sm text-red-700">{error}</p>
      </section>
    )
  }

  if (!impactStory) return null

  return (
    <section className={`${card} mb-8 overflow-hidden`}>
      <div className="border-b border-border bg-primary px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          Indexed impact story
        </p>
        <h2 className="mt-1 text-xl font-semibold">{impactStory.headline}</h2>
        {campaignName && (
          <p className="mt-1 text-sm text-white/80">Campaign: {campaignName}</p>
        )}
        <p className="mt-2 text-xs text-white/60">{impactStory.baselineLabel}</p>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm leading-relaxed text-muted">{impactStory.narrative}</p>

        {showRebalanceAction && (
          <div className="mt-5 rounded-lg border border-primary/20 bg-primary-soft px-4 py-4">
            <p className="text-sm font-medium text-ink">
              AI strategy preview — shift 10% budget from Google to Meta
            </p>
            <p className="mt-1 text-xs text-muted">
              Portfolio index could rise from 107 to ~112 based on current channel ROAS.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onToggleRebalancePreview}
                className={rebalancePreviewActive ? btnSecondary : btnPrimary}
              >
                {rebalancePreviewActive ? 'Exit preview' : 'Simulate rebalance'}
              </button>
              {rebalancePreviewActive && (
                <span className="text-xs font-medium text-primary">
                  Preview active — see highlighted rows in the table below
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {impactStory.metrics.map((m) => (
            <IndexMetricCard key={m.label} metric={m} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImpactStoryPanel
