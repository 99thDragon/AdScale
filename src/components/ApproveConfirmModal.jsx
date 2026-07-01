import { useState } from 'react'
import { btnPrimary, btnSecondary, card, labelCaps } from '../styles/ui'

function ApproveConfirmModal({ campaign, selectedChannelLabels, onConfirm, onClose, confirming }) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-heading"
    >
      <div className={`${card} w-full max-w-md`}>
        <div className="border-b border-border px-6 py-4">
          <h3 id="confirm-heading" className="text-lg font-semibold text-ink">
            Confirm before spend
          </h3>
          <p className="mt-1 text-sm text-muted">
            Nothing launches until you confirm. Review the commitment below.
          </p>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="rounded-lg border border-border bg-canvas px-4 py-3">
            <p className="text-sm font-medium text-ink">{campaign.name}</p>
            <p className="mt-2 text-sm text-muted">
              Budget cap: <span className="font-semibold text-ink">{campaign.budget}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Estimated spend:{' '}
              <span className="font-semibold text-ink">
                {campaign.estimatedSpend.weeklyMin} – {campaign.estimatedSpend.weeklyMax} / week
              </span>
            </p>
          </div>

          <div>
            <p className={labelCaps}>Channels</p>
            <ul className="mt-1 list-inside list-disc text-sm text-muted">
              {selectedChannelLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-warning-soft px-4 py-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-sm text-ink">
              I understand that approving will commit budget on the selected channels. No spend
              occurs until I click Confirm & Launch.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} disabled={confirming} className={btnSecondary}>
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || confirming}
            className={btnPrimary}
          >
            {confirming ? 'Launching…' : 'Confirm & Launch'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApproveConfirmModal
