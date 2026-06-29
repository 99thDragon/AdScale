import { CONNECTED_CHANNELS } from './connectedChannels.js'

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

/** @param {CampaignPreview} preview @param {string[]} [selectedChannelIds] */
export function previewToCampaign(preview, selectedChannelIds = []) {
  const channels = CONNECTED_CHANNELS.filter((c) => selectedChannelIds.includes(c.id))
  const platforms = [...new Set(channels.map((c) => c.platform))]
  const platformLabel = platforms.length > 1 ? platforms.join(' + ') : preview.platform
  const channelSuffix =
    channels.length > 0 ? ` (${channels.length} channel${channels.length > 1 ? 's' : ''})` : ''

  return {
    id: preview.id,
    name: `${preview.name}${channelSuffix}`,
    platform: platformLabel,
    status: 'Active',
    budgetSpent: `$0 / ${preview.budget}`,
    ctr: '—',
    conversions: 0,
  }
}
