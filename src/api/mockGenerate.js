/**
 * Dev stand-in for POST /campaigns/generate until the FastAPI backend exists.
 * @param {string} goal
 * @returns {import('../data/campaignTypes.js').CampaignDraft}
 */
export function mockGenerateDraft(goal) {
  const trimmed = goal.trim()
  const isGoogle = /\bgoogle\b/i.test(trimmed)
  const platform = isGoogle ? 'Google Ads' : 'Meta'
  const channels = isGoogle ? ['Google Search', 'Google Display'] : ['Facebook Feed', 'Instagram Stories']

  const budgetMatch = trimmed.match(/\$?\s*([\d,]+)\s*k?\b/i)
  const budgetNum = budgetMatch
    ? Number(budgetMatch[1].replace(/,/g, '')) * (/\dk\b/i.test(budgetMatch[0]) ? 1000 : 1)
    : 2000
  const budget = `$${budgetNum.toLocaleString()}`

  const headline = trimmed.length > 50 ? `${trimmed.slice(0, 50)}…` : trimmed

  return {
    id: `draft-${Date.now()}`,
    goal: trimmed,
    name: `AI Campaign — ${headline || 'New Campaign'}`,
    platform,
    channels,
    budget,
    estimatedSpend: `$${Math.round(budgetNum * 0.85).toLocaleString()} – $${budgetNum.toLocaleString()} / week`,
    audience: inferAudience(trimmed),
    adCopy: inferAdCopy(trimmed),
  }
}

function inferAudience(goal) {
  if (/retarget/i.test(goal)) return 'Website visitors, last 30 days'
  if (/b2b|lead/i.test(goal)) return 'Decision-makers, 25–54, business interests'
  if (/local|store/i.test(goal)) return 'Local radius, 15 miles, in-market shoppers'
  return 'Broad interest targeting, ages 25–45, lookalike from past purchasers'
}

function inferAdCopy(goal) {
  if (/sale|discount/i.test(goal)) {
    return 'Limited-time offer — shop our best deals before they\'re gone. Free shipping on orders over $50.'
  }
  if (/launch|new product/i.test(goal)) {
    return 'Introducing something new. Be the first to try it — click to learn more and get early access.'
  }
  return 'Reach the right customers at the right time. Drive results with messaging tuned to your campaign goal.'
}
