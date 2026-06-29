/**
 * @typedef {{ id: string, name: string, platform: string, status: string, budgetSpent: string, ctr: string, conversions: number }} Campaign
 */

/**
 * Full AI-generated campaign shown on the preview screen before launch.
 * @typedef {{
 *   id: string,
 *   goal: string,
 *   name: string,
 *   platform: string,
 *   channels: string[],
 *   budget: string,
 *   estimatedSpend: {
 *     weeklyMin: string,
 *     weeklyMax: string,
 *     dailyAverage: string,
 *     durationDays: number,
 *     totalEstimate: string,
 *   },
 *   spendByChannel: Array<{ channel: string, amount: string }>,
 *   audience: string,
 *   targeting: string,
 *   adCopy: string,
 * }} CampaignPreview
 */

/** @param {CampaignPreview} preview */
export function previewToCampaign(preview) {
  return {
    id: preview.id,
    name: preview.name,
    platform: preview.platform,
    status: 'Active',
    budgetSpent: `$0 / ${preview.budget}`,
    ctr: '—',
    conversions: 0,
  }
}
