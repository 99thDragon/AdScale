import StatusBadge from './StatusBadge'
import { labelCaps, platformGoogle, platformMeta } from '../styles/ui'

const platformStyles = {
  Meta: platformMeta,
  'Google Ads': platformGoogle,
}

function parseBudgetProgress(budgetSpent) {
  const match = budgetSpent.match(/\$?([\d,]+)\s*\/\s*\$?([\d,]+)/)
  if (!match) return null

  const spent = Number(match[1].replace(/,/g, ''))
  const total = Number(match[2].replace(/,/g, ''))
  if (!total) return null

  return Math.min(Math.round((spent / total) * 100), 100)
}

function CampaignCard({ name, platform, status, budgetSpent, ctr, conversions }) {
  const budgetProgress = parseBudgetProgress(budgetSpent)

  return (
    <article
      tabIndex={0}
      className="rounded-xl border border-border bg-surface p-5 transition hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink">{name}</h3>
          <span
            className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${platformStyles[platform] ?? 'bg-canvas text-muted'}`}
          >
            {platform}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-4">
        <div>
          <p className={labelCaps}>Budget</p>
          <p className="mt-1 text-sm font-medium text-ink">{budgetSpent}</p>
          {budgetProgress !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCaps}>CTR</p>
              <p className="mt-1 text-xl font-semibold text-ink">{ctr}</p>
            </div>
            <div className="border-l border-border pl-4">
              <p className={labelCaps}>Conversions</p>
              <p className="mt-1 text-xl font-semibold text-ink">{conversions}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CampaignCard
