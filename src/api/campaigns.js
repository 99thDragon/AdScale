const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function parseError(res) {
  const err = await res.json().catch(() => ({}))
  const fallback =
    res.status === 502
      ? 'Backend unavailable — start the API on port 8000 or run without VITE_USE_REAL_API'
      : `Request failed (${res.status})`
  throw new Error(err.message ?? err.detail ?? fallback)
}

/**
 * @param {string} goal
 * @returns {Promise<{ campaign: import('../data/campaignTypes.js').CampaignPreview }>}
 */
export async function generateCampaignPreview(goal) {
  const res = await fetch(`${API_BASE}/campaigns/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal }),
  })

  if (!res.ok) await parseError(res)
  return res.json()
}

/**
 * @returns {Promise<{ campaigns: import('../data/campaignTypes.js').Campaign[], suggestions: import('./mockPerformance.js').OptimizationSuggestion[] }>}
 */
export async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/campaigns`)

  if (!res.ok) await parseError(res)
  return res.json()
}

/**
 * @param {string} campaignId
 * @returns {Promise<{ impactStory: import('./mockPerformance.js').ImpactStory, campaignId: string }>}
 */
export async function fetchImpactStory(campaignId) {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/impact-story`)

  if (!res.ok) await parseError(res)
  return res.json()
}
