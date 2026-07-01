function IndexMetricCard({ metric }) {
  const trendUp = metric.trend.startsWith('+')
  const trendDown = metric.trend.startsWith('-')
  const detail = metric.baselineDetail

  return (
    <div className="group relative rounded-lg border border-border bg-canvas px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{metric.label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{metric.value}</p>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="cursor-help text-sm font-medium text-accent underline decoration-dotted underline-offset-2"
          aria-describedby={`index-tip-${metric.label.replace(/\s+/g, '-')}`}
        >
          Index {metric.index}
        </button>
        <span
          className={`text-xs font-medium ${
            trendUp ? 'text-success' : trendDown ? 'text-danger' : 'text-muted'
          }`}
        >
          {metric.trend}
        </span>
      </div>

      <div
        id={`index-tip-${metric.label.replace(/\s+/g, '-')}`}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-xs leading-relaxed text-muted opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <p className="font-medium text-ink">{detail?.benchmark ?? 'Category baseline'}</p>
        <p className="mt-1">{detail?.formula ?? `Indexed vs. baseline 100 → ${metric.index}`}</p>
        {detail?.note && <p className="mt-1 text-subtle">{detail.note}</p>}
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-surface" />
      </div>
    </div>
  )
}

export default IndexMetricCard
