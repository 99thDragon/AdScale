import { useState } from 'react'
import { formatCurrency, saveGuardrails } from '../data/guardrails'

function GuardrailsPanel({ guardrails, onChange, readOnly = false }) {
  const [saved, setSaved] = useState(false)

  function handleChange(field, value) {
    const num = Number(value)
    if (Number.isNaN(num) || num < 0) return
    onChange({ ...guardrails, [field]: num })
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    saveGuardrails(guardrails)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (readOnly) {
    return (
      <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <span className="font-medium text-slate-800">Guardrails: </span>
        Spend cap {formatCurrency(guardrails.spendCap)} · Approval required above{' '}
        {formatCurrency(guardrails.approvalThreshold)}
      </div>
    )
  }

  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Budget guardrails</h2>
      <p className="mt-1 text-sm text-slate-500">
        Set limits the agent cannot exceed. Campaigns above the approval threshold require
        your sign-off before spend is committed.
      </p>

      <form onSubmit={handleSave} className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="spend-cap" className="block text-sm font-medium text-slate-700">
            Spend cap (total)
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              id="spend-cap"
              type="number"
              min="0"
              step="100"
              value={guardrails.spendCap}
              onChange={(e) => handleChange('spendCap', e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">Maximum the agent can spend across all campaigns.</p>
        </div>

        <div>
          <label htmlFor="approval-threshold" className="block text-sm font-medium text-slate-700">
            Approval threshold
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              id="approval-threshold"
              type="number"
              min="0"
              step="50"
              value={guardrails.approvalThreshold}
              onChange={(e) => handleChange('approvalThreshold', e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Campaigns with budget above this amount need marketing-lead approval.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Save guardrails
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </form>
    </section>
  )
}

export default GuardrailsPanel
