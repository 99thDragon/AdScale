/**
 * @typedef {{ id: string, name: string, platform: string, status: string, budgetSpent: string, ctr: string, conversions: number }} Campaign
 */

/**
 * AI-generated campaign structure shown on the review screen before launch.
 * @typedef {{
 *   id: string,
 *   goal: string,
 *   name: string,
 *   platform: string,
 *   channels: string[],
 *   budget: string,
 *   estimatedSpend: string,
 *   audience: string,
 *   adCopy: string,
 * }} CampaignDraft
 */

/** @param {CampaignDraft} draft */
export function draftToCampaign(draft) {
  return {
    id: draft.id,
    name: draft.name,
    platform: draft.platform,
    status: 'Active',
    budgetSpent: `$0 / ${draft.budget}`,
    ctr: '—',
    conversions: 0,
  }
}
