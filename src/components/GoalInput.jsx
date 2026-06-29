import { useEffect, useState } from 'react'
import { generateCampaignPreview } from '../api/campaigns'
import {
  deleteBriefTemplate,
  loadBriefTemplates,
  saveBriefTemplate,
} from '../data/briefTemplates'

function GoalInput({ onCampaignPreview }) {
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    setTemplates(loadBriefTemplates())
  }, [])

  async function handleRunAgent() {
    const trimmed = goal.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    try {
      const data = await generateCampaignPreview(trimmed)
      onCampaignPreview?.(data.campaign)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleLoadTemplate(templateGoal) {
    setGoal(templateGoal)
    setError(null)
  }

  function handleSaveTemplate(e) {
    e.preventDefault()
    const name = templateName.trim()
    const trimmed = goal.trim()
    if (!name || !trimmed) return

    const saved = saveBriefTemplate(name, trimmed)
    setTemplates((prev) => [saved, ...prev])
    setTemplateName('')
    setShowSaveForm(false)
  }

  function handleDeleteTemplate(id) {
    deleteBriefTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      {templates.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Saved briefs
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-1"
              >
                <button
                  type="button"
                  onClick={() => handleLoadTemplate(tpl.goal)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  title={tpl.goal}
                >
                  {tpl.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(tpl.id)}
                  className="rounded-full px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label={`Delete template ${tpl.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label htmlFor="goal-input" className="mb-3 block text-sm font-medium text-slate-700">
        Campaign Goal
      </label>
      <textarea
        id="goal-input"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Describe your campaign goal — offer, audience, channels, budget..."
        disabled={loading}
        className="min-h-[120px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />

      {showSaveForm && (
        <form onSubmit={handleSaveTemplate} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!templateName.trim() || !goal.trim()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowSaveForm(false)}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowSaveForm(true)}
          disabled={!goal.trim() || loading}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          Save as template
        </button>
        <button
          type="button"
          onClick={handleRunAgent}
          disabled={!goal.trim() || loading}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {loading ? 'Running…' : 'Run Agent'}
        </button>
      </div>
    </div>
  )
}

export default GoalInput
