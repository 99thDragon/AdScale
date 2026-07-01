import { useEffect, useState } from 'react'
import { generateCampaignPreview } from '../api/campaigns'
import {
  deleteBriefTemplate,
  loadBriefTemplates,
  saveBriefTemplate,
} from '../data/briefTemplates'
import { PROMPT_STARTERS } from '../data/promptStarters'
import { btnGhost, btnPrimary, btnSecondary, cardPad, input, labelCaps } from '../styles/ui'

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

  function handleStarterClick(starterGoal) {
    setGoal(starterGoal)
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
    <div className={cardPad}>
      {templates.length > 0 && (
        <div className="mb-4">
          <p className={labelCaps}>Saved briefs</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center gap-1 rounded-full border border-border bg-canvas pl-3 pr-1"
              >
                <button
                  type="button"
                  onClick={() => handleLoadTemplate(tpl.goal)}
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                  title={tpl.goal}
                >
                  {tpl.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(tpl.id)}
                  className="rounded-full px-2 py-0.5 text-xs text-subtle hover:bg-primary-soft hover:text-ink"
                  aria-label={`Delete template ${tpl.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label htmlFor="goal-input" className="mb-3 block text-sm font-medium text-ink">
        Campaign goal
      </label>
      <textarea
        id="goal-input"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Describe your campaign — offer, audience, channels, budget…"
        disabled={loading}
        className={`${input} min-h-[120px] resize-y bg-canvas px-4 py-3`}
      />

      <div className="mt-3">
        <p className={labelCaps}>Try a starter prompt</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROMPT_STARTERS.map((starter) => (
            <button
              key={starter.label}
              type="button"
              onClick={() => handleStarterClick(starter.goal)}
              disabled={loading}
              title={starter.goal}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary disabled:opacity-50"
            >
              {starter.label}
            </button>
          ))}
        </div>
      </div>

      {showSaveForm && (
        <form onSubmit={handleSaveTemplate} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name…"
            className={`${input} flex-1`}
          />
          <button type="submit" disabled={!templateName.trim() || !goal.trim()} className={btnSecondary}>
            Save
          </button>
          <button type="button" onClick={() => setShowSaveForm(false)} className={btnGhost}>
            Cancel
          </button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowSaveForm(true)}
          disabled={!goal.trim() || loading}
          className={btnGhost}
        >
          Save as template
        </button>
        <button
          type="button"
          onClick={handleRunAgent}
          disabled={!goal.trim() || loading}
          className={btnPrimary}
        >
          {loading ? 'Running…' : 'Run Agent'}
        </button>
      </div>
    </div>
  )
}

export default GoalInput
