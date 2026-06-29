const platformStyles = {
  Meta: 'bg-blue-100 text-blue-800',
  'Google Ads': 'bg-red-100 text-red-800',
}

function PreviewField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  )
}

function CampaignPreviewScreen({ campaign, onApprove, onCancel, approving }) {
  const { estimatedSpend } = campaign

  return (
    <section
      className="my-8 overflow-hidden rounded-xl border-2 border-indigo-200 bg-white shadow-md"
      aria-labelledby="preview-heading"
    >
      <div className="border-b border-indigo-100 bg-indigo-50 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Pre-launch preview
            </p>
            <h2 id="preview-heading" className="mt-1 text-xl font-semibold text-slate-900">
              Full campaign preview
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Review the complete structure and estimated spend before approving.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Not launched — no spend committed
          </span>
        </div>
      </div>

      {/* Estimated spend hero */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Estimated spend
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-3xl font-bold">
              {estimatedSpend.weeklyMin} – {estimatedSpend.weeklyMax}
            </p>
            <p className="mt-1 text-sm text-slate-300">per week</p>
          </div>
          <div className="border-l border-slate-600 pl-6">
            <p className="text-xl font-semibold">{estimatedSpend.dailyAverage}</p>
            <p className="mt-1 text-sm text-slate-300">daily average</p>
          </div>
          <div className="border-l border-slate-600 pl-6">
            <p className="text-xl font-semibold">{estimatedSpend.totalEstimate}</p>
            <p className="mt-1 text-sm text-slate-300">
              total over {estimatedSpend.durationDays} days
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Budget cap: {campaign.budget} · Estimates based on AI pacing model; actual spend may vary.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${platformStyles[campaign.platform] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {campaign.platform}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PreviewField label="Total budget">{campaign.budget}</PreviewField>
          <PreviewField label="Channels">
            <ul className="list-inside list-disc space-y-0.5">
              {campaign.channels.map((ch) => (
                <li key={ch}>{ch}</li>
              ))}
            </ul>
          </PreviewField>
          <PreviewField label="Target audience">{campaign.audience}</PreviewField>
          <PreviewField label="Targeting">{campaign.targeting}</PreviewField>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Spend by channel (weekly)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {campaign.spendByChannel.map(({ channel, amount }) => (
              <div
                key={channel}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{channel}</span>
                <span className="text-sm font-semibold text-slate-900">{amount}</span>
              </div>
            ))}
          </div>
        </div>

        <PreviewField label="Ad copy">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 italic leading-relaxed">
            {campaign.adCopy}
          </p>
        </PreviewField>

        <PreviewField label="Original goal">
          <p className="text-slate-600">{campaign.goal}</p>
        </PreviewField>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={approving}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={approving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {approving ? 'Launching…' : 'Approve & Launch'}
        </button>
      </div>
    </section>
  )
}

export default CampaignPreviewScreen
