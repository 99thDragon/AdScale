/**
 * Mock 24-hour spend buckets for drawer sparkline (hourly UTC).
 * @typedef {{ hour: string, amount: number }} SpendHour
 */

/** @param {string} campaignId @returns {SpendHour[]} */
export function getHourlySpend(campaignId) {
  const seed = campaignId.split('').reduce((n, c) => n + c.charCodeAt(0), 0)
  const hours = []

  for (let h = 0; h < 24; h += 1) {
    const wave = Math.sin((h / 24) * Math.PI * 2 + seed) * 0.35 + 0.65
    const peak = h >= 9 && h <= 21 ? 1.25 : 0.55
    const amount = Math.round((12 + (seed % 8)) * wave * peak)
    hours.push({
      hour: `${String(h).padStart(2, '0')}:00`,
      amount,
    })
  }

  return hours
}
