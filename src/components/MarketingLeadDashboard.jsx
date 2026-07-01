import { useMemo, useRef, useState } from 'react'
import GuardrailsPanel from './GuardrailsPanel'
import ImpactStoryPanel from './ImpactStoryPanel'
import StatusBadge from './StatusBadge'
import CampaignAgentDrawer from './CampaignAgentDrawer'
import PlatformBadge from './PlatformBadge'
import SpendUtilizationBar from './SpendUtilizationBar'
import { formatCurrency, summarizeCampaigns } from '../data/guardrails'
import { computeRebalancePreview } from '../data/guardrailsWhatIf'
import { filterCampaignsByDateRange, getDateRangeLabel } from '../data/dateRange'
import { card, labelCaps, sectionHeading, tabularNum } from '../styles/ui'

function MarketingLeadDashboard({
  campaigns,
  dateRanges,
  loading,
  error,
  guardrails,
  onGuardrailsSave,
  impactStory,
  impactLoading,
  impactError,
}) {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rebalancePreviewActive, setRebalancePreviewActive] = useState(false)
  const tableRef = useRef(null)

  const rangedCampaigns = useMemo(
    () => filterCampaignsByDateRange(campaigns, dateRanges),
    [campaigns, dateRanges],
  )

  const summary = summarizeCampaigns(rangedCampaigns)
  const spendUtilization =
    guardrails.spendCap > 0
      ? Math.min(Math.round((summary.totalSpent / guardrails.spendCap) * 100), 100)
      : 0

  const rebalanceAdjustments = useMemo(
    () => (rebalancePreviewActive ? computeRebalancePreview(rangedCampaigns) : null),
    [rangedCampaigns, rebalancePreviewActive],
  )

  const rangeLabel = getDateRangeLabel(dateRanges)

  function handleRowClick(campaign) {
    setSelectedCampaign(campaign)
    setDrawerOpen(true)
  }

  function handleCloseDrawer() {
    setDrawerOpen(false)
  }

  function handleToggleRebalancePreview() {
    setRebalancePreviewActive((prev) => {
      const next = !prev
      if (next) {
        setTimeout(() => {
          tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      }
      return next
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className={sectionHeading}>Marketing lead overview</h2>
        <p className="mt-1 text-sm text-muted">
          {rangeLabel} portfolio results — click a row for performance history and agent activity.
        </p>
      </div>

      <GuardrailsPanel
        guardrails={guardrails}
        onChange={onGuardrailsSave}
        campaigns={rangedCampaigns}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={`${card} p-4`}>
          <p className={labelCaps}>Total spent</p>
          <p className={`mt-2 text-2xl font-semibold text-ink ${tabularNum}`}>
            {formatCurrency(summary.totalSpent)}
          </p>
          <SpendUtilizationBar
            spent={summary.totalSpent}
            cap={guardrails.spendCap}
            utilization={spendUtilization}
            compact
          />
        </div>
        <SummaryCard label="Total budget" value={formatCurrency(summary.totalBudget)} />
        <SummaryCard label="Conversions" value={summary.totalConversions.toLocaleString()} />
        <SummaryCard label="Active campaigns" value={String(summary.activeCount)} />
      </div>

      <ImpactStoryPanel
        impactStory={impactStory}
        campaignName="Portfolio overview"
        loading={impactLoading}
        error={impactError}
        showRebalanceAction
        rebalancePreviewActive={rebalancePreviewActive}
        onToggleRebalancePreview={handleToggleRebalancePreview}
      />

      {rebalancePreviewActive && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-ink">
          <span className="font-medium">Preview state active.</span> Meta rows show proposed budget
          increases; Google rows are dimmed. Approve from guardrails when ready.
        </div>
      )}

      <section
        ref={tableRef}
        className={`${card} mb-8 overflow-hidden transition ${
          rebalancePreviewActive ? 'ring-2 ring-primary/40' : ''
        }`}
      >
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">Campaign results & spend</h3>
          <p className="mt-1 text-xs text-muted">
            {rangeLabel} · Click a row for historical breakdown and agent actions
            {rebalancePreviewActive && ' · Rebalance preview highlighted below'}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="px-6 py-8 text-sm text-muted">Loading campaign data…</p>
        ) : rangedCampaigns.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted">No campaigns to report on yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-canvas text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Campaign</th>
                  <th className="px-6 py-3 text-left font-medium">Platform</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className={`px-6 py-3 text-right font-medium ${tabularNum}`}>
                    {rebalancePreviewActive ? 'Spend (preview)' : 'Spend'}
                  </th>
                  <th className={`px-6 py-3 text-right font-medium ${tabularNum}`}>CTR</th>
                  <th className={`px-6 py-3 text-right font-medium ${tabularNum}`}>Conversions</th>
                  <th className="px-4 py-3 font-medium" aria-hidden="true" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rangedCampaigns.map((c) => {
                  const adjustment = rebalanceAdjustments?.[c.id]
                  const spendDisplay = adjustment?.preview ?? c.budgetSpent
                  const isGoogle = c.platform === 'Google Ads'
                  const isMetaGain = Boolean(adjustment && adjustment.delta > 0)
                  const isGoogleCut = Boolean(adjustment && adjustment.delta < 0)

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleRowClick(c)}
                      className={`group cursor-pointer transition-colors ${
                        rebalancePreviewActive && isGoogle
                          ? 'bg-canvas/60 opacity-50'
                          : rebalancePreviewActive && isMetaGain
                            ? 'bg-primary-soft/70 ring-1 ring-inset ring-primary/30 animate-pulse-soft'
                            : 'hover:bg-canvas'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-ink group-hover:text-primary">
                        {c.name}
                      </td>
                      <td className="px-6 py-4">
                        <PlatformBadge platform={c.platform} compact />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className={`px-6 py-4 text-right ${tabularNum}`}>
                        {adjustment ? (
                          <div>
                            <p className="text-primary">{spendDisplay}</p>
                            <p className="text-xs text-muted line-through">{c.budgetSpent}</p>
                            <p
                              className={`text-xs ${
                                isMetaGain
                                  ? 'text-primary animate-pulse-soft'
                                  : isGoogleCut
                                    ? 'text-muted'
                                    : 'text-accent'
                              }`}
                            >
                              {adjustment.delta > 0 ? '+' : ''}
                              {formatCurrency(adjustment.delta)} budget
                            </p>
                          </div>
                        ) : (
                          <span className="text-ink">{c.budgetSpent}</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right text-ink ${tabularNum}`}>{c.ctr}</td>
                      <td className={`px-6 py-4 text-right text-ink ${tabularNum}`}>
                        {c.conversions}
                      </td>
                      <td className="px-4 py-4 text-muted opacity-0 transition group-hover:opacity-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CampaignAgentDrawer
        campaign={selectedCampaign}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        dateRangeLabel={rangeLabel}
      />
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className={`${card} p-4`}>
      <p className={labelCaps}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold text-ink ${tabularNum}`}>{value}</p>
    </div>
  )
}

export default MarketingLeadDashboard
