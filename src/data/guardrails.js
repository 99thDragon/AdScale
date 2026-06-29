const STORAGE_KEY = 'adscale.guardrails'

/**
 * @typedef {{ spendCap: number, approvalThreshold: number }} Guardrails
 */

const DEFAULT_GUARDRAILS = {
  spendCap: 10000,
  approvalThreshold: 500,
}

/** @returns {Guardrails} */
export function loadGuardrails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_GUARDRAILS }
    return { ...DEFAULT_GUARDRAILS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_GUARDRAILS }
  }
}

/** @param {Guardrails} guardrails */
export function saveGuardrails(guardrails) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guardrails))
}

/** @param {string} budgetSpent e.g. "$1,240 / $2,000" */
export function parseBudgetSpent(budgetSpent) {
  const match = budgetSpent.match(/\$?([\d,]+)\s*\/\s*\$?([\d,]+)/)
  if (!match) return { spent: 0, total: 0 }
  return {
    spent: Number(match[1].replace(/,/g, '')),
    total: Number(match[2].replace(/,/g, '')),
  }
}

/** @param {import('../data/mockCampaigns.js').Campaign[]} campaigns */
export function summarizeCampaigns(campaigns) {
  let totalSpent = 0
  let totalBudget = 0
  let totalConversions = 0
  let activeCount = 0

  for (const c of campaigns) {
    const { spent, total } = parseBudgetSpent(c.budgetSpent)
    totalSpent += spent
    totalBudget += total
    totalConversions += c.conversions ?? 0
    if (c.status === 'Active' || c.status === 'Optimizing') activeCount += 1
  }

  return { totalSpent, totalBudget, totalConversions, activeCount }
}

export function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`
}
