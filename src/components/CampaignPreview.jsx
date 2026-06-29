import { useEffect, useState } from 'react'
import ChannelSelector from './ChannelSelector'
import ApproveConfirmModal from './ApproveConfirmModal'
import { defaultSelectedChannels, getChannelLabels } from '../data/connectedChannels'
import {
  formatBudget,
  parseBudgetAmount,
  recalculateEstimatedSpend,
} from '../data/campaignTypes'

const platformStyles = {
  Meta: 'bg-blue-100 text-blue-800',
  'Google Ads': 'bg-red-100 text-red-800',
}

const inputClassName =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

function EditableField({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wide text-slate-400">
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
                Edit copy, targeting, and budget, pick channels, then explicitly confirm before any
                spend.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Not launched — no spend committed
            </span>
          </div>
        </div>

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
            Budget cap: {draft.budget} · Estimates update as you edit budget; actual spend may vary.
          </p>
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

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
            <ChannelSelector
              selectedIds={selectedChannelIds}
              onChange={setSelectedChannelIds}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EditableField label="Total budget" htmlFor="preview-budget">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <input
                  id="preview-budget"
                  type="number"
                  min="1"
                  step="100"
                  value={budgetInput}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className={`${inputClassName} pl-7`}
                />
              </div>
              {budgetError && (
                <p className="mt-1 text-xs text-red-600" role="alert">
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
                className={inputClassName}
              />
            </EditableField>

            <EditableField label="Targeting" htmlFor="preview-targeting">
              <input
                id="preview-targeting"
                type="text"
                value={draft.targeting}
                onChange={(e) => updateDraft('targeting', e.target.value)}
                className={inputClassName}
              />
            </EditableField>
          </div>

          <EditableField label="Ad copy" htmlFor="preview-ad-copy">
            <textarea
              id="preview-ad-copy"
              value={draft.adCopy}
              onChange={(e) => updateDraft('adCopy', e.target.value)}
              rows={4}
              className={`${inputClassName} resize-y leading-relaxed`}
            />
          </EditableField>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Original goal</p>
            <p className="mt-1 text-sm text-slate-600">{draft.goal}</p>
          </div>
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
            onClick={handleRequestApprove}
            disabled={!canProceed || approving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
