import mockCampaigns from '../data/mockCampaigns.js'

/**
 * Dev stand-in for POST /campaigns/generate until the FastAPI backend exists.
 * @param {string} goal
 */
export function mockGenerateCampaigns(goal) {
  const trimmed = goal.trim()
  const headline = trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed || 'New Campaign'
  const platform = /\bgoogle\b/i.test(trimmed) ? 'Google Ads' : 'Meta'

  const draft = {
    id: `draft-${Date.now()}`,
    name: `AI Draft — ${headline}`,
    platform,
    status: 'Optimizing',
    budgetSpent: '$0 / $1,000',
    ctr: '—',
    conversions: 0,
  }

  return { campaigns: [draft, ...mockCampaigns.slice(0, 3)] }
}
