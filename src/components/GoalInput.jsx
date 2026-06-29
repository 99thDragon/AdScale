import { useState } from 'react'
import { generateCampaignPreview } from '../api/campaigns'

function GoalInput({ onCampaignPreview }) {
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
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
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end">
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
