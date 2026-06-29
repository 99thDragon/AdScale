import CampaignCard from './CampaignCard'

function CampaignGrid({
  campaigns = [],
  loading,
  error,
  selectedCampaignId,
  onSelectCampaign,
}) {
  return (
    <div className="my-8 border-t border-slate-200 pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800">Active AI Campaigns</h2>
        {loading && <span className="text-sm text-slate-500">Refreshing…</span>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">Loading campaigns…</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
