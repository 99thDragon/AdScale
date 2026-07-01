import { formatCurrency } from '../data/guardrails'

function getBarClass(utilization) {
  if (utilization >= 95) return 'bg-danger animate-pulse-bar'
  if (utilization >= 90) return 'bg-warm animate-pulse-soft'
  return 'bg-accent'
}

function SpendUtilizationBar({ spent, cap, utilization, compact = false }) {
  const pct = Math.min(utilization, 100)
  const barClass = getBarClass(pct)
  const isCritical = pct >= 90

  if (compact) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Cap {formatCurrency(cap)}</span>
          <span className={isCritical ? 'font-medium text-warm' : ''}>{pct}% utilized</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct >= 95 && (
          <p className="mt-2 text-xs font-medium text-danger">Cap nearly reached</p>
        )}
        {pct >= 90 && pct < 95 && (
          <p className="mt-2 text-xs font-medium text-warm">Approaching cap</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-ink">Spend vs. cap</span>
        <span className={isCritical ? 'font-medium text-warm' : 'text-muted'}>
          {formatCurrency(spent)} / {formatCurrency(cap)}
          {isCritical && ` · ${pct}% utilized`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct >= 95 && (
        <p className="mt-2 text-xs font-medium text-danger">
          Budget cap nearly reached — review spend before end of period.
        </p>
      )}
      {pct >= 90 && pct < 95 && (
        <p className="mt-2 text-xs font-medium text-warm">
          Approaching spend cap — monitor utilization closely.
        </p>
      )}
    </div>
  )
}

export default SpendUtilizationBar
