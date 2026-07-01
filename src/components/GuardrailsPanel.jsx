import { useMemo, useState } from 'react'
import {
  formatCurrency,
  loadGuardrails,
  saveGuardrails,
} from '../data/guardrails'
import {
  simulateApprovalThresholdChange,
  simulateSpendCapChange,
} from '../data/guardrailsWhatIf'
import CurrencyInput from './CurrencyInput'
import { CheckIcon, SaveToast } from './SaveToast'
import { card, cardPad } from '../styles/ui'

function WhatIfNote({ insight }) {
  if (!insight) return null

  const styles =
    insight.type === 'warning'
      ? 'border-warm/30 bg-warm-soft text-ink'
      : 'border-accent/30 bg-accent-soft text-ink'

  return (
    <p className={`mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${styles}`}>
      {insight.message}
    </p>
  )
}

function GuardrailsPanel({ guardrails, onChange, readOnly = false, campaigns = [] }) {
  const [saved, setSaved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [savedBaseline, setSavedBaseline] = useState(() => loadGuardrails())

  const spendCapInsight = useMemo(
    () =>
      readOnly
        ? null
        : simulateSpendCapChange(campaigns, guardrails.spendCap, savedBaseline.spendCap),
    [campaigns, guardrails.spendCap, readOnly, savedBaseline.spendCap],
  )

  const approvalInsight = useMemo(
    () =>
      readOnly
        ? null
        : simulateApprovalThresholdChange(
            campaigns,
            guardrails.approvalThreshold,
            savedBaseline.approvalThreshold,
          ),
    [campaigns, guardrails.approvalThreshold, readOnly, savedBaseline.approvalThreshold],
  )

  function handleChange(field, value) {
    const num = Number(value)
    if (Number.isNaN(num) || num < 0) return
    onChange({ ...guardrails, [field]: num })
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    saveGuardrails(guardrails)
    setSavedBaseline({ ...guardrails })
    setSaved(true)
    setShowToast(true)
    setTimeout(() => setSaved(false), 2500)
    setTimeout(() => setShowToast(false), 3200)
  }

  if (readOnly) {
    return (
      <div className={`${card} mb-6 px-4 py-3 text-sm text-muted`}>
        <span className="font-medium text-ink">Guardrails: </span>
        Spend cap {formatCurrency(guardrails.spendCap)} · Approval required above{' '}
        {formatCurrency(guardrails.approvalThreshold)}
      </div>
    )
  }

  return (
    <>
      <SaveToast visible={showToast} />

      <section className={`${cardPad} mb-8`}>
        <h2 className="text-lg font-semibold text-ink">Budget guardrails</h2>
        <p className="mt-1 text-sm text-muted">
          Adjust limits live — see projected impact before you save.
        </p>

        <form onSubmit={handleSave} className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="spend-cap" className="block text-sm font-medium text-ink">
              Spend cap (total)
            </label>
            <CurrencyInput
              id="spend-cap"
              value={guardrails.spendCap}
              step={100}
              onChange={(e) => handleChange('spendCap', e.target.value)}
            />
            <WhatIfNote insight={spendCapInsight} />
            {!spendCapInsight && (
              <p className="mt-1 text-xs text-subtle">
                Maximum the agent can spend across all campaigns.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="approval-threshold" className="block text-sm font-medium text-ink">
              Approval threshold
            </label>
            <CurrencyInput
              id="approval-threshold"
              value={guardrails.approvalThreshold}
              step={50}
              onChange={(e) => handleChange('approvalThreshold', e.target.value)}
            />
            <WhatIfNote insight={approvalInsight} />
            {!approvalInsight && (
              <p className="mt-1 text-xs text-subtle">
                Campaigns with budget above this amount need marketing-lead approval.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition ${
                saved ? 'bg-success' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {saved ? (
                <>
                  <CheckIcon />
                  Guardrails saved
                </>
              ) : (
                'Save guardrails'
              )}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default GuardrailsPanel
