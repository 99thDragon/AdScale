const priorityStyles = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-slate-200 bg-slate-50',
}

const priorityBadge = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-600',
}

function OptimizationSuggestions({ suggestions = [], loading }) {
  if (loading) {
    return (
      <section className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">AI optimization suggestions</h2>
        <p className="mt-4 text-sm text-slate-500">Loading suggestions…</p>
      </section>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <section className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800">AI optimization suggestions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Plain-language recommendations from the agent — review before applying changes.
        </p>
      </div>
      <ul className="space-y-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className={`rounded-lg border px-4 py-3 ${priorityStyles[s.priority] ?? priorityStyles.low}`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{s.campaignName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityBadge[s.priority] ?? priorityBadge.low}`}
              >
                {s.priority}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{s.message}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OptimizationSuggestions
