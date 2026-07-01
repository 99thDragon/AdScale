import StatusBadge from './StatusBadge'
import PlatformBadge from './PlatformBadge'
import SpendSparkline from './SpendSparkline'
import { getAgentActions } from '../data/mockAgentActions'
import { getCampaignHistory } from '../data/mockCampaignHistory'
import { getCampaignCreatives } from '../data/mockCampaignCreatives'
import { btnSecondary } from '../styles/ui'

function CampaignAgentDrawer({ campaign, open, onClose, dateRangeLabel = 'Lifetime' }) {
  if (!open || !campaign) return null

  const actions = getAgentActions(campaign.id)
  const history = getCampaignHistory(campaign.id)
  const creatives = getCampaignCreatives(campaign.id)

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-ink/30"
        aria-label="Close campaign details"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
        role="dialog"
        aria-labelledby="drawer-heading"
      >
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">
                Campaign deep dive
              </p>
              <h2 id="drawer-heading" className="mt-1 text-lg font-semibold text-ink">
                {campaign.name}
              </h2>
              <div className="mt-2">
                <PlatformBadge platform={campaign.platform} />
              </div>
            </div>
            <StatusBadge status={campaign.status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="mb-8 rounded-lg border border-border bg-canvas p-4">
            <h3 className="text-sm font-semibold text-ink">24-hour spend</h3>
            <div className="mt-3">
              <SpendSparkline campaignId={campaign.id} />
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-sm font-semibold text-ink">Live ad creatives</h3>
            <p className="mt-1 text-xs text-muted">Active placements from connected ad accounts</p>
            <ul className="mt-3 space-y-3">
              {creatives.map((creative) => (
                <li
                  key={creative.id}
                  className="flex gap-3 rounded-lg border border-border bg-canvas p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-medium text-primary">
                    Ad
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{creative.headline}</p>
                    <p className="mt-0.5 text-xs text-muted">{creative.format}</p>
                    <span
                      className={`mt-1 inline-block text-xs font-medium ${
                        creative.status === 'Active' ? 'text-success' : 'text-muted'
                      }`}
                    >
                      {creative.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-sm font-semibold text-ink">Historical breakdown</h3>
            <p className="mt-1 text-xs text-muted">
              Weekly performance — current view: {dateRangeLabel}
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-canvas text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 font-medium">Spend</th>
                    <th className="px-3 py-2 font-medium">Conv.</th>
                    <th className="px-3 py-2 font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((row) => (
                    <tr key={row.period}>
                      <td className="px-3 py-2.5 text-muted">{row.period}</td>
                      <td className="px-3 py-2.5 font-medium text-ink">{row.spend}</td>
                      <td className="px-3 py-2.5 font-medium text-ink">{row.conversions}</td>
                      <td className="px-3 py-2.5 text-ink">{row.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-ink">Recent agent actions</h3>
            <p className="mt-1 text-sm text-muted">
              Automated changes the agent took on this campaign.
            </p>
            <ol className="mt-3 space-y-4">
              {actions.map((item) => (
                <li
                  key={`${item.time}-${item.action}`}
                  className="rounded-lg border border-border bg-canvas px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{item.action}</span>
                    <span className="text-xs text-subtle">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className={`${btnSecondary} w-full`}>
            Close
          </button>
        </div>
      </aside>
    </>
  )
}

export default CampaignAgentDrawer
