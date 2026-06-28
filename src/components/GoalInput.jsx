import { useState } from 'react'

function GoalInput() {
  const [goal, setGoal] = useState('')

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
        className="min-h-[120px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!goal.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          Run Agent
        </button>
      </div>
    </div>
  )
}

export default GoalInput
