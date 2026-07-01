import { card, sectionHeading } from '../styles/ui'
import CampaignCard from './CampaignCard'

function CampaignGrid({
  campaigns = [],
  loading,
  error,
  selectedCampaignId,
  onSelectCampaign,
}) {
  return (
    <div className="my-8 border-t border-border pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className={sectionHeading}>Active AI Campaigns</h2>
        {loading && <span className="text-sm text-muted">Refreshing…</span>}
      </div>

      {error && (
        <div className={`${card} mb-4 border-danger/30 bg-danger-soft px-4 py-3 text-sm text-red-700`}>
          {error}
        </div>
      )}

      {loading && campaigns.length === 0 ? (
        <div className={`${card} border-dashed px-6 py-12 text-center`}>
          <p className="text-sm text-muted">Loading campaigns…</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className={`${card} border-dashed px-6 py-12 text-center`}>
          <p className="text-sm text-muted">
            No active campaigns yet. Enter a goal above and run the agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignCard {...campaign} />
              {onSelectCampaign && (
                <button
                  type="button"
                  onClick={() => onSelectCampaign(campaign.id)}
                  className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    selectedCampaignId === campaign.id
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border bg-surface text-muted hover:border-primary/30 hover:bg-canvas hover:text-ink'
                  }`}
                >
                  {selectedCampaignId === campaign.id ? 'Impact story selected' : 'View impact story'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CampaignGrid
