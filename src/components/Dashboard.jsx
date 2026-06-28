import GoalInput from './GoalInput'
import CampaignCard from './CampaignCard'
import mockCampaigns from '../data/mockCampaigns'

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
          <p className="mt-1 text-slate-500">Autonomous Ad Manager Dashboard</p>
        </header>

        <GoalInput />

        <div className="my-8 border-t border-slate-200 pt-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-800">Active AI Campaigns</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
