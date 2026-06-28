const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Optimizing: 'bg-yellow-100 text-yellow-800',
  Paused: 'bg-slate-100 text-slate-600',
}

const platformStyles = {
  Meta: 'bg-blue-100 text-blue-800',
  'Google Ads': 'bg-red-100 text-red-800',
}

function parseBudgetProgress(budgetSpent) {
  const match = budgetSpent.match(/\$?([\d,]+)\s*\/\s*\$?([\d,]+)/)
  if (!match) return null

  const spent = Number(match[1].replace(/,/g, ''))
  const total = Number(match[2].replace(/,/g, ''))
  if (!total) return null

  return Math.min(Math.round((spent / total) * 100), 100)
}

function CampaignCard({ name, platform, status, budgetSpent, ctr, conversions }) {
  const budgetProgress = parseBudgetProgress(budgetSpent)

  return (
    <article
      tabIndex={0}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{name}</h3>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${platformStyles[platform] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {platform}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.Paused}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Budget</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{budgetSpent}</p>
          {budgetProgress !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">CTR</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{ctr}</p>
            </div>
            <div className="border-l border-slate-100 pl-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Conversions</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{conversions}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CampaignCard
