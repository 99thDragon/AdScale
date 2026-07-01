import { formatBudget, recalculateEstimatedSpend } from '../data/campaignTypes.js'
import { mockGenerateCampaignPreview } from './mockGenerate.js'
import { mockFetchCampaigns, mockFetchImpactStory } from './mockPerformance.js'

// Point this at the FastAPI backend (e.g. http://localhost:8000). When unset,
// the app runs entirely on the mock data below — no backend required.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const USE_REAL_API = Boolean(API_BASE)

async function parseError(res) {
  const err = await res.json().catch(() => ({}))
  const fallback =
    res.status === 502
      ? 'Backend unavailable — start the API on port 8000 or unset VITE_API_BASE_URL'
      : `Request failed (${res.status})`
  throw new Error(err.message ?? err.detail ?? fallback)
}

// --- Map the backend contract onto the shapes the UI components expect. -------
// The backend returns a nested `Campaign` ({ id, status, draft, performance });
// the components want the flat preview/card/story shapes defined in
// data/campaignTypes.js and api/mockPerformance.js.

const STATUS_LABELS = {
  active: 'Active',
  optimizing: 'Optimizing',
  paused: 'Paused',
  approved: 'Paused',
  draft: 'Paused',
}

function backendToPreview(campaign, goal) {
  const draft = campaign.draft
  const total = draft.budget?.total ?? 0
  const channels = draft.channels ?? []
  const perChannel = channels.length ? Math.round(total / channels.length) : total
  const firstCopy = draft.ad_copy?.[0]
  const audience = draft.audience
    ? [draft.audience.description, draft.audience.age_range].filter(Boolean).join(' · ')
    : ''
  const targeting = draft.audience
    ? [
        (draft.audience.interests ?? []).join(', '),
        (draft.audience.locations ?? []).join(', '),
      ]
        .filter(Boolean)
        .join(' | ') || draft.objective
    : draft.objective

  return {
    id: campaign.id,
    goal,
    name: draft.name,
    platform: channels[0] ?? 'Meta',
    channels,
    budget: formatBudget(total),
    estimatedSpend: recalculateEstimatedSpend(total),
    spendByChannel: channels.map((channel) => ({
      channel,
      amount: `${formatBudget(perChannel)} / week`,
    })),
    audience,
    targeting,
    adCopy: firstCopy ? `${firstCopy.headline} — ${firstCopy.body}` : '',
  }
}

function backendToCard(campaign) {
  const draft = campaign.draft
  const perf = campaign.performance
  return {
    id: campaign.id,
    name: draft.name,
    platform: (draft.channels ?? [])[0] ?? 'Meta',
    status: STATUS_LABELS[campaign.status] ?? 'Paused',
    budgetSpent: `${formatBudget(perf?.spend ?? 0)} / ${formatBudget(draft.budget?.total ?? 0)}`,
    ctr: perf ? `${perf.ctr}%` : '—',
    conversions: perf?.conversions ?? 0,
  }
}

function backendToImpactStory(story, name) {
  const idx = story.indexed_metrics ?? {}
  const metrics = []
  if (idx.ctr != null) {
    metrics.push({ label: 'CTR index', value: `${idx.ctr}`, index: idx.ctr, trend: '' })
  }
  if (idx.conversion_efficiency != null) {
    metrics.push({
      label: 'Conversion efficiency',
      value: `${idx.conversion_efficiency}`,
      index: idx.conversion_efficiency,
      trend: '',
    })
  }
  const headlineIndex = Math.round(idx.ctr ?? idx.conversion_efficiency ?? 100)
  return {
    impactStory: {
      headline: `${name ?? 'Campaign'}: index ${headlineIndex} vs. baseline (100)`,
      baselineLabel: 'Indexed to a 100 baseline',
      narrative: story.summary,
      metrics,
    },
    campaignId: story.id,
  }
}

// --- Public API (unchanged signatures — components don't need to change). ------

export async function generateCampaignPreview(goal) {
  if (!USE_REAL_API) return { campaign: mockGenerateCampaignPreview(goal) }

  const res = await fetch(`${API_BASE}/campaigns/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal }),
  })
  if (!res.ok) await parseError(res)
  return { campaign: backendToPreview(await res.json(), goal) }
}

export async function fetchCampaigns() {
  if (!USE_REAL_API) return mockFetchCampaigns()

  const res = await fetch(`${API_BASE}/campaigns`)
  if (!res.ok) await parseError(res)
  const campaigns = await res.json()

  // Pull optimization suggestions from live campaigns and flatten them.
  const live = campaigns
    .filter((c) => c.status === 'active' || c.status === 'optimizing')
    .slice(0, 5)
  const suggestionGroups = await Promise.all(
    live.map(async (c) => {
      const r = await fetch(`${API_BASE}/campaigns/${c.id}/optimizations`)
      if (!r.ok) return []
      const list = await r.json()
      return list.map((s, i) => ({
        id: `${c.id}-${i}`,
        campaignId: c.id,
        campaignName: c.draft.name,
        message: `${s.title} — ${s.rationale}`,
        priority: s.impact,
      }))
    }),
  )

  return { campaigns: campaigns.map(backendToCard), suggestions: suggestionGroups.flat() }
}

export async function fetchImpactStory(campaignId, campaignName) {
  if (!USE_REAL_API) return mockFetchImpactStory(campaignId)

  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/impact-story`)
  if (!res.ok) await parseError(res)
  return backendToImpactStory(await res.json(), campaignName)
}
