/**
 * Weekly performance snapshots per campaign (mock until backend is live).
 * @typedef {{ period: string, spend: string, conversions: number, ctr: string }} HistoryPoint
 */

/** @type {Record<string, HistoryPoint[]>} */
const MOCK_HISTORY = {
  '1': [
    { period: 'This week', spend: '$420', conversions: 28, ctr: '2.6%' },
    { period: 'Last week', spend: '$380', conversions: 24, ctr: '2.3%' },
    { period: '2 weeks ago', spend: '$440', conversions: 35, ctr: '2.5%' },
  ],
  '2': [
    { period: 'This week', spend: '$210', conversions: 11, ctr: '1.9%' },
    { period: 'Last week', spend: '$195', conversions: 9, ctr: '1.7%' },
    { period: '2 weeks ago', spend: '$230', conversions: 12, ctr: '1.8%' },
  ],
  '3': [
    { period: 'This week', spend: '$890', conversions: 42, ctr: '3.2%' },
    { period: 'Last week', spend: '$820', conversions: 38, ctr: '3.0%' },
    { period: '2 weeks ago', spend: '$760', conversions: 36, ctr: '2.9%' },
  ],
  '4': [
    { period: 'This week', spend: '$0', conversions: 0, ctr: '—' },
    { period: 'Last week', spend: '$120', conversions: 6, ctr: '4.0%' },
    { period: '2 weeks ago', spend: '$180', conversions: 9, ctr: '4.3%' },
  ],
  '5': [
    { period: 'This week', spend: '$560', conversions: 29, ctr: '3.0%' },
    { period: 'Last week', spend: '$510', conversions: 26, ctr: '2.8%' },
    { period: '2 weeks ago', spend: '$480', conversions: 24, ctr: '2.7%' },
  ],
  '6': [
    { period: 'This week', spend: '$340', conversions: 14, ctr: '2.2%' },
    { period: 'Last week', spend: '$310', conversions: 12, ctr: '2.0%' },
    { period: '2 weeks ago', spend: '$295', conversions: 11, ctr: '2.1%' },
  ],
}

/** @param {string} campaignId @returns {HistoryPoint[]} */
export function getCampaignHistory(campaignId) {
  return MOCK_HISTORY[campaignId] ?? [
    { period: 'This week', spend: '$0', conversions: 0, ctr: '—' },
    { period: 'Last week', spend: '$0', conversions: 0, ctr: '—' },
  ]
}
