import { formatCurrency, parseBudgetSpent } from './guardrails'

/** @typedef {'days' | 'months' | 'years'} DateRangeGroup */

/**
 * @typedef {{ id: string, label: string, group: DateRangeGroup, getDays: () => number }} DateRangeOption
 */

const LIFETIME_DAYS = 365

/** @type {DateRangeOption[]} */
export const DATE_RANGE_OPTIONS = [
  { id: '1d', label: 'Last 1 day', group: 'days', getDays: () => 1 },
  { id: '7d', label: 'Last 7 days', group: 'days', getDays: () => 7 },
  { id: '14d', label: 'Last 14 days', group: 'days', getDays: () => 14 },
  { id: '30d', label: 'Last 30 days', group: 'days', getDays: () => 30 },
  { id: '90d', label: 'Last 90 days', group: 'days', getDays: () => 90 },
  {
    id: 'mtd',
    label: 'Month to date',
    group: 'months',
    getDays: () => new Date().getDate(),
  },
  { id: '1m', label: 'Last month', group: 'months', getDays: () => 30 },
  { id: '3m', label: 'Last 3 months', group: 'months', getDays: () => 90 },
  { id: '6m', label: 'Last 6 months', group: 'months', getDays: () => 180 },
  {
    id: 'ytd',
    label: 'Year to date',
    group: 'years',
    getDays: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      return Math.ceil((now.getTime() - start.getTime()) / 86_400_000)
    },
  },
  { id: '1y', label: 'Last 12 months', group: 'years', getDays: () => 365 },
  { id: 'lifetime', label: 'Lifetime', group: 'years', getDays: () => LIFETIME_DAYS },
]

export const DATE_RANGE_GROUPS = [
  { id: 'days', label: 'Days' },
  { id: 'months', label: 'Months' },
  { id: 'years', label: 'Years' },
]

export const DEFAULT_DATE_RANGES = ['7d']

/** @param {string} rangeId */
export function getDateRangeOption(rangeId) {
  return DATE_RANGE_OPTIONS.find((r) => r.id === rangeId)
}

/** @param {string[]} rangeIds */
export function getCombinedDays(rangeIds) {
  if (!rangeIds.length) return getDateRangeOption('7d')?.getDays() ?? 7

  const days = rangeIds
    .map((id) => getDateRangeOption(id)?.getDays() ?? 0)
    .filter((d) => d > 0)

  if (days.length === 0) return 7
  return Math.max(...days)
}

/** @param {string[]} rangeIds */
export function getDateRangeScale(rangeIds) {
  const days = getCombinedDays(rangeIds)
  return Math.min(days / LIFETIME_DAYS, 1)
}

/** @param {import('./mockCampaigns.js').Campaign} campaign @param {number} scale */
export function scaleCampaignForRange(campaign, scale) {
  if (scale >= 1) return campaign

  const { spent, total } = parseBudgetSpent(campaign.budgetSpent)
  const scaledSpent = Math.max(Math.round(spent * scale), 0)
  const scaledConversions = Math.max(Math.round((campaign.conversions ?? 0) * scale), 0)

  return {
    ...campaign,
    budgetSpent: `${formatCurrency(scaledSpent)} / ${formatCurrency(total)}`,
    conversions: scaledConversions,
  }
}

/** @param {import('./mockCampaigns.js').Campaign[]} campaigns @param {string[]} rangeIds */
export function filterCampaignsByDateRange(campaigns, rangeIds) {
  const scale = getDateRangeScale(rangeIds)
  return campaigns.map((c) => scaleCampaignForRange(c, scale))
}

/** @param {string[]} rangeIds */
export function getDateRangeLabel(rangeIds) {
  const ids = rangeIds.length ? rangeIds : DEFAULT_DATE_RANGES
  const labels = ids
    .map((id) => getDateRangeOption(id)?.label)
    .filter(Boolean)

  if (labels.length === 0) return 'Last 7 days'
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return labels.join(' · ')
  return `${labels[0]} + ${labels.length - 1} more`
}

/** @param {string[]} rangeIds @param {string} rangeId */
export function toggleDateRange(rangeIds, rangeId) {
  if (rangeIds.includes(rangeId)) {
    const next = rangeIds.filter((id) => id !== rangeId)
    return next.length > 0 ? next : DEFAULT_DATE_RANGES
  }
  return [...rangeIds, rangeId]
}
