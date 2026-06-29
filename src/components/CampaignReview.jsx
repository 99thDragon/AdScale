const platformStyles = {
  Meta: 'bg-blue-100 text-blue-800',
  'Google Ads': 'bg-red-100 text-red-800',
}

function ReviewField({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  )
}

function CampaignReview({ draft, onApprove, onCancel, approving }) {
  return (
    <section
      className="my-8 rounded-xl border-2 border-indigo-200 bg-white shadow-md"
      aria-labelledby="review-heading"
    >
      <div className="border-b border-indigo-100 bg-indigo-50 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Pending your approval
            </p>
            <h2 id="review-heading" className="mt-1 text-xl font-semibold text-slate-900">
              Review campaign before launch
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Nothing will go live until you approve. Review the AI-generated structure below.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Draft — not launched
          </span>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{draft.name}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${platformStyles[draft.platform] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {draft.platform}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ReviewField label="Total budget">{draft.budget}</ReviewField>
          <ReviewField label="Estimated spend">{draft.estimatedSpend}</ReviewField>
          <ReviewField label="Channels">
            <ul className="list-inside list-disc space-y-0.5">
              {draft.channels.map((ch) => (
                <li key={ch}>{ch}</li>
              ))}
            </ul>
          </ReviewField>
          <ReviewField label="Target audience">{draft.audience}</ReviewField>
        </div>

        <ReviewField label="Ad copy">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 italic leading-relaxed">
            {draft.adCopy}
          </p>
        </ReviewField>

        <ReviewField label="Original goal">
          <p className="text-slate-600">{draft.goal}</p>
        </ReviewField>
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

export default CampaignReview
