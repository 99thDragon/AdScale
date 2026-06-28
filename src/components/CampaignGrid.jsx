import CampaignCard from './CampaignCard'

function CampaignGrid({ campaigns = [] }) {
  return (
    <div className="my-8 border-t border-slate-200 pt-8">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">Active AI Campaigns</h2>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No active campaigns yet. Enter a goal above and run the agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CampaignGrid
