import { useState } from 'react'
import GoalInput from './GoalInput'
import CampaignGrid from './CampaignGrid'
import mockCampaigns from '../data/mockCampaigns'

function Dashboard() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
          <p className="mt-1 text-slate-500">Autonomous Ad Manager Dashboard</p>
        </header>

        <GoalInput onCampaignsGenerated={setCampaigns} />

        <CampaignGrid campaigns={campaigns} />
      </div>
    </div>
  )
}

export default Dashboard
