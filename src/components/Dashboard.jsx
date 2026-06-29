import { useState } from 'react'
import GoalInput from './GoalInput'
import CampaignPreview from './CampaignPreview'
import CampaignGrid from './CampaignGrid'
import mockCampaigns from '../data/mockCampaigns'
import { previewToCampaign } from '../data/campaignTypes'

function Dashboard() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [preview, setPreview] = useState(null)
  const [approving, setApproving] = useState(false)

  function handleApprove() {
    if (!preview) return
    setApproving(true)
    setTimeout(() => {
      setCampaigns((prev) => [previewToCampaign(preview), ...prev])
      setPreview(null)
      setApproving(false)
    }, 400)
  }

  function handleCancel() {
    setPreview(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
          <p className="mt-1 text-slate-500">Autonomous Ad Manager Dashboard</p>
        </header>

        <GoalInput onCampaignPreview={setPreview} />

        {preview && (
          <CampaignPreview
            campaign={preview}
            onApprove={handleApprove}
            onCancel={handleCancel}
            approving={approving}
          />
        )}

        <CampaignGrid campaigns={campaigns} />
      </div>
    </div>
  )
}

export default Dashboard
