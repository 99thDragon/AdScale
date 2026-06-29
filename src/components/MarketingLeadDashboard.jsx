import GuardrailsPanel from './GuardrailsPanel'
import ImpactStoryPanel from './ImpactStoryPanel'
import { formatCurrency, summarizeCampaigns } from '../data/guardrails'

const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Optimizing: 'bg-yellow-100 text-yellow-800',
  Paused: 'bg-slate-100 text-slate-600',
}

function MarketingLeadDashboard({
  campaigns,
  loading,
  error,
  guardrails,
  onGuardrailsSave,
  impactStory,
  impactLoading,
  impactError,
}) {
  const summary = summarizeCampaigns(campaigns)
  const spendUtilization =
    guardrails.spendCap > 0
      ? Math.min(Math.round((summary.totalSpent / guardrails.spendCap) * 100), 100)
      : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Marketing lead overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Results and spend across all campaigns — read-only performance view.
        </p>
      </div>

      <GuardrailsPanel guardrails={guardrails} onChange={onGuardrailsSave} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total spent" value={formatCurrency(summary.totalSpent)} />
        <SummaryCard label="Total budget" value={formatCurrency(summary.totalBudget)} />
        <SummaryCard label="Conversions" value={summary.totalConversions.toLocaleString()} />
        <SummaryCard label="Active campaigns" value={String(summary.activeCount)} />
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700">Spend vs. cap</span>
          <span className="text-slate-500">
            {formatCurrency(summary.totalSpent)} / {formatCurrency(guardrails.spendCap)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${spendUtilization > 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: `${spendUtilization}%` }}
          />
        </div>
      </div>

      <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Campaign results & spend</h3>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500">Loading campaign data…</p>
        ) : campaigns.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">No campaigns to report on yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Campaign</th>
                  <th className="px-6 py-3 font-medium">Platform</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Spend</th>
                  <th className="px-6 py-3 font-medium">CTR</th>
                  <th className="px-6 py-3 font-medium">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.platform}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[c.status] ?? statusStyles.Paused}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{c.budgetSpent}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{c.ctr}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{c.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ImpactStoryPanel
        impactStory={impactStory}
        campaignName="Portfolio overview"
        loading={impactLoading}
        error={impactError}
      />
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default MarketingLeadDashboard
