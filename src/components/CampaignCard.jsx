const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Optimizing: 'bg-yellow-100 text-yellow-800',
  Paused: 'bg-slate-100 text-slate-600',
}

function CampaignCard({ name, platform, status, budgetSpent, ctr, conversions }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="mt-1 text-sm text-slate-500">{platform}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.Paused}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Budget</p>
          <p className="text-sm font-medium text-slate-700">{budgetSpent}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">CTR</p>
            <p className="text-xl font-bold text-slate-900">{ctr}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Conversions</p>
            <p className="text-xl font-bold text-slate-900">{conversions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignCard
