function ImpactStoryPanel({ impactStory, campaignName, loading, error }) {
  if (loading) {
    return (
      <section className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Impact story</h2>
        <p className="mt-4 text-sm text-slate-500">Loading indexed summary…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="my-8 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
      </section>
    )
  }

  if (!impactStory) return null

  return (
    <section className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Indexed impact story
        </p>
        <h2 className="mt-1 text-xl font-semibold">{impactStory.headline}</h2>
        {campaignName && (
          <p className="mt-1 text-sm text-slate-300">Campaign: {campaignName}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">{impactStory.baselineLabel}</p>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm leading-relaxed text-slate-700">{impactStory.narrative}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {impactStory.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {m.label}
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">{m.value}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-600">Index {m.index}</span>
                <span
                  className={`text-xs font-medium ${m.trend.startsWith('+') ? 'text-green-600' : m.trend.startsWith('-') ? 'text-red-600' : 'text-slate-500'}`}
                >
                  {m.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImpactStoryPanel
