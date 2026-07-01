import { useEffect, useState } from 'react'
import ChannelSelector from './ChannelSelector'
import ApproveConfirmModal from './ApproveConfirmModal'
import { defaultSelectedChannels, getChannelLabels } from '../data/connectedChannels'
import {
  formatBudget,
  parseBudgetAmount,
  recalculateEstimatedSpend,
} from '../data/campaignTypes'
import {
  btnPrimary,
  btnSecondary,
  card,
  input,
  labelCaps,
  platformGoogle,
  platformMeta,
} from '../styles/ui'

const platformStyles = {
  Meta: platformMeta,
  'Google Ads': platformGoogle,
}

function EditableField({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={`${labelCaps} block`}>
        {label}
      </label>
      {children}
    </div>
  )
}

function CampaignPreviewScreen({ campaign, onApprove, onCancel, approving }) {
  const [draft, setDraft] = useState(campaign)
  const [budgetInput, setBudgetInput] = useState(() => String(parseBudgetAmount(campaign.budget) ?? ''))
  const [budgetError, setBudgetError] = useState(null)
  const [selectedChannelIds, setSelectedChannelIds] = useState(() =>
    defaultSelectedChannels(campaign.channels),
  )
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    setDraft(campaign)
    setBudgetInput(String(parseBudgetAmount(campaign.budget) ?? ''))
    setBudgetError(null)
    setSelectedChannelIds(defaultSelectedChannels(campaign.channels))
  }, [campaign])

  const selectedLabels = getChannelLabels(selectedChannelIds)
  const canProceed = selectedChannelIds.length > 0 && !budgetError && budgetInput.trim() !== ''

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function handleBudgetChange(value) {
    setBudgetInput(value)
    const amount = parseBudgetAmount(value)
    if (!amount) {
      setBudgetError('Enter a valid budget amount')
      return
    }
    setBudgetError(null)
    const budget = formatBudget(amount)
    const estimatedSpend = recalculateEstimatedSpend(amount, draft.estimatedSpend.durationDays)
    setDraft((prev) => ({ ...prev, budget, estimatedSpend }))
  }

  function handleRequestApprove() {
    if (!canProceed) return
    setShowConfirm(true)
  }

  function handleConfirmLaunch() {
    onApprove(selectedChannelIds, draft)
  }

  const { estimatedSpend } = draft

  return (
    <>
      <section className={`${card} my-8 overflow-hidden`} aria-labelledby="preview-heading">
        <div className="border-b border-border bg-primary-soft px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={`${labelCaps} text-primary`}>Pre-launch preview</p>
              <h2 id="preview-heading" className="mt-1 text-xl font-semibold text-ink">
                Full campaign preview
              </h2>
              <p className="mt-1 text-sm text-muted">
                Edit copy, targeting, and budget, pick channels, then confirm before any spend.
              </p>
            </div>
            <span className="rounded-md bg-warning-soft px-3 py-1 text-xs font-medium text-amber-800">
              Not launched
            </span>
          </div>
        </div>

        <div className="border-b border-border bg-primary px-6 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Estimated spend
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-3xl font-semibold">
                {estimatedSpend.weeklyMin} – {estimatedSpend.weeklyMax}
              </p>
              <p className="mt-1 text-sm text-white/70">per week</p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <p className="text-xl font-semibold">{estimatedSpend.dailyAverage}</p>
              <p className="mt-1 text-sm text-white/70">daily average</p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <p className="text-xl font-semibold">{estimatedSpend.totalEstimate}</p>
              <p className="mt-1 text-sm text-white/70">
                total over {estimatedSpend.durationDays} days
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/60">
            Budget cap: {draft.budget} · Estimates update as you edit budget.
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-ink">{draft.name}</h3>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${platformStyles[draft.platform] ?? 'bg-canvas text-muted'}`}
            >
              {draft.platform}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-canvas px-4 py-4">
            <ChannelSelector selectedIds={selectedChannelIds} onChange={setSelectedChannelIds} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EditableField label="Total budget" htmlFor="preview-budget">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
                  $
                </span>
                <input
                  id="preview-budget"
                  type="number"
                  min="1"
                  step="100"
                  value={budgetInput}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className={`${input} mt-1 pl-7`}
                />
              </div>
              {budgetError && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {budgetError}
                </p>
              )}
            </EditableField>

            <EditableField label="Target audience" htmlFor="preview-audience">
              <input
                id="preview-audience"
                type="text"
                value={draft.audience}
                onChange={(e) => updateDraft('audience', e.target.value)}
                className={`${input} mt-1`}
              />
            </EditableField>

            <EditableField label="Targeting" htmlFor="preview-targeting">
              <input
                id="preview-targeting"
                type="text"
                value={draft.targeting}
                onChange={(e) => updateDraft('targeting', e.target.value)}
                className={`${input} mt-1`}
              />
            </EditableField>
          </div>

          <EditableField label="Ad copy" htmlFor="preview-ad-copy">
            <textarea
              id="preview-ad-copy"
              value={draft.adCopy}
              onChange={(e) => updateDraft('adCopy', e.target.value)}
              rows={4}
              className={`${input} mt-1 resize-y leading-relaxed`}
            />
          </EditableField>

          <div>
            <p className={labelCaps}>Original goal</p>
            <p className="mt-1 text-sm text-muted">{draft.goal}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border bg-canvas px-6 py-4">
          <button type="button" onClick={onCancel} disabled={approving} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRequestApprove}
            disabled={!canProceed || approving}
            className={btnPrimary}
          >
            Review & Approve
          </button>
        </div>
      </section>

      {showConfirm && (
        <ApproveConfirmModal
          campaign={draft}
          selectedChannelLabels={selectedLabels}
          onConfirm={handleConfirmLaunch}
          onClose={() => setShowConfirm(false)}
          confirming={approving}
        />
      )}
    </>
  )
}

export default CampaignPreviewScreen
