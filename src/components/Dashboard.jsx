import { useState } from 'react'
import GoalInput from './GoalInput'
import CampaignReview from './CampaignReview'
import CampaignGrid from './CampaignGrid'
import mockCampaigns from '../data/mockCampaigns'
import { draftToCampaign } from '../data/campaignTypes'

function Dashboard() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [draft, setDraft] = useState(null)
  const [approving, setApproving] = useState(false)

  function handleApprove() {
    if (!draft) return
    setApproving(true)
    setTimeout(() => {
      setCampaigns((prev) => [draftToCampaign(draft), ...prev])
      setDraft(null)
      setApproving(false)
    }, 400)
  }

  function handleCancel() {
    setDraft(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
          <p className="mt-1 text-slate-500">Autonomous Ad Manager Dashboard</p>
        </header>

        <GoalInput onDraftGenerated={setDraft} />

        {draft && (
          <CampaignReview
            draft={draft}
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
