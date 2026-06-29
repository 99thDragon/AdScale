/**
 * Dev stand-in for POST /campaigns/generate until the FastAPI backend exists.
 * @param {string} goal
 * @returns {import('../data/campaignTypes.js').CampaignPreview}
 */
export function mockGenerateCampaignPreview(goal) {
  const trimmed = goal.trim()
  const isGoogle = /\bgoogle\b/i.test(trimmed)
  const platform = isGoogle ? 'Google Ads' : 'Meta'
  const channels = isGoogle
    ? ['Google Search', 'Google Display']
    : ['Facebook Feed', 'Instagram Stories']

  const budgetMatch = trimmed.match(/\$?\s*([\d,]+)\s*k?\b/i)
  const budgetNum = budgetMatch
    ? Number(budgetMatch[1].replace(/,/g, '')) * (/\dk\b/i.test(budgetMatch[0]) ? 1000 : 1)
    : 2000
  const budget = `$${budgetNum.toLocaleString()}`

  const weeklyMax = budgetNum
  const weeklyMin = Math.round(budgetNum * 0.85)
  const dailyAvg = Math.round(budgetNum / 7)
  const durationDays = 14
  const totalEstimate = budgetNum * 2

  const headline = trimmed.length > 50 ? `${trimmed.slice(0, 50)}…` : trimmed

  const channelShare = Math.round(budgetNum / channels.length)

  return {
    id: `preview-${Date.now()}`,
    goal: trimmed,
    name: `AI Campaign — ${headline || 'New Campaign'}`,
    platform,
    channels,
    budget,
    estimatedSpend: {
      weeklyMin: `$${weeklyMin.toLocaleString()}`,
      weeklyMax: `$${weeklyMax.toLocaleString()}`,
      dailyAverage: `$${dailyAvg.toLocaleString()}`,
      durationDays,
      totalEstimate: `$${totalEstimate.toLocaleString()}`,
    },
    spendByChannel: channels.map((channel) => ({
      channel,
      amount: `$${channelShare.toLocaleString()} / week`,
    })),
    audience: inferAudience(trimmed),
    targeting: inferTargeting(trimmed, platform),
    adCopy: inferAdCopy(trimmed),
  }
}

function inferAudience(goal) {
  if (/retarget/i.test(goal)) return 'Website visitors, last 30 days'
  if (/b2b|lead/i.test(goal)) return 'Decision-makers, 25–54, business interests'
  if (/local|store/i.test(goal)) return 'Local radius, 15 miles, in-market shoppers'
  return 'Broad interest targeting, ages 25–45, lookalike from past purchasers'
}

function inferTargeting(goal, platform) {
  const base = platform === 'Meta' ? 'Interest + lookalike' : 'Keyword + in-market'
  if (/sale|discount/i.test(goal)) return `${base}, bargain shoppers, cart abandoners`
  return `${base}, high-intent purchase behavior`
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
