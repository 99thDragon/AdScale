import { formatCurrency, parseBudgetSpent, summarizeCampaigns } from './guardrails'

/**
 * @param {import('./mockCampaigns.js').Campaign[]} campaigns
 * @param {number} newCap
 * @param {number} savedCap
 * @returns {{ type: 'warning' | 'info', message: string } | null}
 */
export function simulateSpendCapChange(campaigns, newCap, savedCap) {
  if (newCap === savedCap || !Number.isFinite(newCap)) return null

  const summary = summarizeCampaigns(campaigns)

  if (newCap < summary.totalSpent) {
    return {
      type: 'warning',
      message: `⚠️ A cap of ${formatCurrency(newCap)} is below current spend (${formatCurrency(summary.totalSpent)}). Active campaigns will be throttled immediately.`,
    }
  }

  if (newCap < savedCap) {
    const active = campaigns.filter((c) => c.status === 'Active' || c.status === 'Optimizing')
    const topSpender = active
      .map((c) => {
        const { spent } = parseBudgetSpent(c.budgetSpent)
        return { name: c.name, spent }
      })
      .sort((a, b) => b.spent - a.spent)[0]

    if (!topSpender) return null

    const reduction = savedCap - newCap
    const hours = Math.max(12, Math.round(36 * (reduction / 1000)))

    return {
      type: 'warning',
      message: `⚠️ Based on current pacing, lowering the cap to ${formatCurrency(newCap)} will automatically pause '${topSpender.name}' within ${hours} hours.`,
    }
  }

  if (newCap > savedCap) {
    const headroom = newCap - summary.totalSpent
    return {
      type: 'info',
      message: `✓ Raising the cap to ${formatCurrency(newCap)} gives the agent ${formatCurrency(Math.max(0, headroom))} headroom before guardrails trigger.`,
    }
  }

  return null
}

/**
 * @param {import('./mockCampaigns.js').Campaign[]} campaigns
 * @param {number} newThreshold
 * @param {number} savedThreshold
 */
export function simulateApprovalThresholdChange(campaigns, newThreshold, savedThreshold) {
  if (newThreshold === savedThreshold || !Number.isFinite(newThreshold)) return null

  const campaignsAbove = (threshold) =>
    campaigns.filter((c) => parseBudgetSpent(c.budgetSpent).total > threshold)

  if (newThreshold < savedThreshold) {
    const count = campaignsAbove(newThreshold).length
    if (count === 0) return null
    return {
      type: 'warning',
      message: `⚠️ Lowering the threshold to ${formatCurrency(newThreshold)} requires your approval for ${count} campaign${count === 1 ? '' : 's'} before the agent can increase spend.`,
    }
  }

  if (newThreshold > savedThreshold) {
    const freed = campaigns.filter((c) => {
      const { total } = parseBudgetSpent(c.budgetSpent)
      return total > savedThreshold && total <= newThreshold
    }).length

    if (freed > 0) {
      return {
        type: 'info',
        message: `✓ ${freed} campaign${freed === 1 ? '' : 's'} can now auto-optimize without lead approval.`,
      }
    }
  }

  return null
}

/** @param {import('./mockCampaigns.js').Campaign[]} campaigns @param {number} [shiftPercent] */
export function computeRebalancePreview(campaigns, shiftPercent = 0.1) {
  /** @type {Record<string, { preview: string, delta: number }>} */
  const adjustments = {}

  for (const c of campaigns) {
    const { spent, total } = parseBudgetSpent(c.budgetSpent)
    let newTotal = total
    if (c.platform === 'Meta') newTotal = Math.round(total * (1 + shiftPercent))
    else if (c.platform === 'Google Ads') newTotal = Math.round(total * (1 - shiftPercent))

    adjustments[c.id] = {
      preview: `$${spent.toLocaleString()} / $${newTotal.toLocaleString()}`,
      delta: newTotal - total,
    }
  }

  return adjustments
}
