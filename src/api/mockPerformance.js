import mockCampaigns from '../data/mockCampaigns.js'

/**
 * @typedef {{ id: string, campaignId: string, campaignName: string, message: string, priority: 'high' | 'medium' | 'low' }} OptimizationSuggestion
 */

/**
 * @typedef {{ label: string, value: string, index: number, trend: string }} ImpactMetric
 */

/**
 * @typedef {{ headline: string, narrative: string, baselineLabel: string, metrics: ImpactMetric[] }} ImpactStory
 */

/** @type {OptimizationSuggestion[]} */
const MOCK_SUGGESTIONS = [
  {
    id: 'sug-1',
    campaignId: '1',
    campaignName: 'Summer Sale — Meta',
    message:
      'CTR on Facebook Feed is 18% above average. Consider shifting 15% of budget from Instagram Stories to Feed to capture more clicks at lower CPA.',
    priority: 'high',
  },
  {
    id: 'sug-2',
    campaignId: '2',
    campaignName: 'Brand Awareness — Google Ads',
    message:
      'Search terms with high spend but zero conversions detected. Add 12 negative keywords to reduce wasted spend by an estimated $120/week.',
    priority: 'high',
  },
  {
    id: 'sug-3',
    campaignId: '3',
    campaignName: 'Product Launch — Meta',
    message:
      'Audience frequency is reaching 4.2x on retargeting. Refresh creative or expand lookalike audience by 10% to avoid ad fatigue.',
    priority: 'medium',
  },
  {
    id: 'sug-4',
    campaignId: '5',
    campaignName: 'Holiday Promo — Meta',
    message:
      'Weekend conversion rate is 34% higher than weekdays. Enable day-parting to increase weekend budget allocation automatically.',
    priority: 'medium',
  },
]

/** @type {Record<string, ImpactStory>} */
const MOCK_IMPACT_STORIES = {
  '1': {
    headline: 'Summer Sale index: 118 vs. category baseline (100)',
    baselineLabel: 'Indexed to 2020 category baseline = 100',
    narrative:
      'This campaign is delivering above-average return for spend in your vertical. Conversion volume grew 22% week-over-week while CPA held steady — a strong signal to maintain or modestly increase budget.',
    metrics: [
      { label: 'ROAS', value: '3.4x', index: 118, trend: '+14%' },
      { label: 'CPA', value: '$14.20', index: 88, trend: '-6%' },
      { label: 'Conv. rate', value: '4.1%', index: 112, trend: '+9%' },
      { label: 'Spend efficiency', value: '92%', index: 105, trend: '+3%' },
    ],
  },
  '2': {
    headline: 'Brand Awareness index: 94 vs. category baseline (100)',
    baselineLabel: 'Indexed to 2020 category baseline = 100',
    narrative:
      'Awareness metrics are solid but conversion lag suggests mid-funnel optimization opportunity. The agent recommends tightening keyword targeting before scaling spend.',
    metrics: [
      { label: 'ROAS', value: '1.8x', index: 94, trend: '-2%' },
      { label: 'CPA', value: '$32.50', index: 108, trend: '+5%' },
      { label: 'Conv. rate', value: '1.9%', index: 91, trend: '-4%' },
      { label: 'Spend efficiency', value: '78%', index: 94, trend: '-1%' },
    ],
  },
}

/** Default aggregate story when no campaign-specific story exists */
const DEFAULT_IMPACT_STORY = {
  headline: 'Portfolio index: 107 vs. category baseline (100)',
  baselineLabel: 'Indexed to 2020 category baseline = 100',
  narrative:
    'Across active campaigns, aggregate performance sits 7% above the indexed baseline. Meta channels are outperforming Google on ROAS; rebalancing 10% of budget could lift portfolio index to ~112.',
  metrics: [
    { label: 'Portfolio ROAS', value: '2.9x', index: 107, trend: '+8%' },
    { label: 'Blended CPA', value: '$19.80', index: 95, trend: '-3%' },
    { label: 'Total conversions', value: '482', index: 112, trend: '+18%' },
    { label: 'Budget utilization', value: '86%', index: 102, trend: '+2%' },
  ],
}

export function mockFetchCampaigns() {
  return {
    campaigns: mockCampaigns,
    suggestions: MOCK_SUGGESTIONS,
  }
}

/** @param {string} campaignId */
export function mockFetchImpactStory(campaignId) {
  const story = MOCK_IMPACT_STORIES[campaignId] ?? DEFAULT_IMPACT_STORY
  return { impactStory: story, campaignId }
}

export { MOCK_SUGGESTIONS, MOCK_IMPACT_STORIES, DEFAULT_IMPACT_STORY }
