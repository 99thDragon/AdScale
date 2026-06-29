import { useState } from 'react'

function ApproveConfirmModal({ campaign, selectedChannelLabels, onConfirm, onClose, confirming }) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-heading"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 id="confirm-heading" className="text-lg font-semibold text-slate-900">
            Confirm before spend
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Nothing launches until you confirm. Review the commitment below.
          </p>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{campaign.name}</p>
            <p className="mt-2 text-sm text-slate-600">
              Budget cap: <span className="font-semibold text-slate-900">{campaign.budget}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Estimated spend:{' '}
              <span className="font-semibold text-slate-900">
                {campaign.estimatedSpend.weeklyMin} – {campaign.estimatedSpend.weeklyMax} / week
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Channels</p>
            <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
              {selectedChannelLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-800">
              I understand that approving will commit budget on the selected channels. No spend
              occurs until I click Confirm & Launch.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || confirming}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {confirming ? 'Launching…' : 'Confirm & Launch'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApproveConfirmModal
