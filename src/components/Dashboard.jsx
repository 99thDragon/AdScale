import { useCallback, useEffect, useState } from 'react'
import GoalInput from './GoalInput'
import CampaignPreview from './CampaignPreview'
import CampaignGrid from './CampaignGrid'
import OptimizationSuggestions from './OptimizationSuggestions'
import ImpactStoryPanel from './ImpactStoryPanel'
import RoleToggle from './RoleToggle'
import GuardrailsPanel from './GuardrailsPanel'
import MarketingLeadDashboard from './MarketingLeadDashboard'
import { fetchCampaigns, fetchImpactStory } from '../api/campaigns'
import { previewToCampaign } from '../data/campaignTypes'
import { loadGuardrails } from '../data/guardrails'

function Dashboard() {
  const [role, setRole] = useState('manager')
  const [guardrails, setGuardrails] = useState(loadGuardrails)

  const [campaigns, setCampaigns] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [campaignsError, setCampaignsError] = useState(null)

  const [preview, setPreview] = useState(null)
  const [approving, setApproving] = useState(false)

  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [impactStory, setImpactStory] = useState(null)
  const [impactLoading, setImpactLoading] = useState(false)
  const [impactError, setImpactError] = useState(null)

  const [leadImpactStory, setLeadImpactStory] = useState(null)
  const [leadImpactLoading, setLeadImpactLoading] = useState(false)
  const [leadImpactError, setLeadImpactError] = useState(null)

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true)
    setCampaignsError(null)
    try {
      const data = await fetchCampaigns()
      setCampaigns(data.campaigns ?? [])
      setSuggestions(data.suggestions ?? [])
    } catch (err) {
      setCampaignsError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setCampaignsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  useEffect(() => {
    if (role !== 'manager' || !selectedCampaignId) {
      if (role !== 'manager') setImpactStory(null)
      return
    }

    let cancelled = false
    setImpactLoading(true)
    setImpactError(null)

    fetchImpactStory(selectedCampaignId)
      .then((data) => {
        if (!cancelled) setImpactStory(data.impactStory)
      })
      .catch((err) => {
        if (!cancelled) {
          setImpactError(err instanceof Error ? err.message : 'Failed to load impact story')
          setImpactStory(null)
        }
      })
      .finally(() => {
        if (!cancelled) setImpactLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedCampaignId, role])

  useEffect(() => {
    if (role !== 'lead') {
      setLeadImpactStory(null)
      return
    }

    let cancelled = false
    setLeadImpactLoading(true)
    setLeadImpactError(null)

    fetchImpactStory('portfolio')
      .then((data) => {
        if (!cancelled) setLeadImpactStory(data.impactStory)
      })
      .catch((err) => {
        if (!cancelled) {
          setLeadImpactError(err instanceof Error ? err.message : 'Failed to load impact story')
          setLeadImpactStory(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLeadImpactLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role])

  function handleApprove(selectedChannelIds, editedPreview) {
    const previewData = editedPreview ?? preview
    if (!previewData) return
    setApproving(true)
    setTimeout(async () => {
      const newCampaign = previewToCampaign(previewData, selectedChannelIds)
      setCampaigns((prev) => [newCampaign, ...prev])
      setPreview(null)
      setApproving(false)
      try {
        const data = await fetchCampaigns()
        setSuggestions(data.suggestions ?? [])
      } catch {
        // suggestions stay stale until next full load
      }
    }, 400)
  }

  function handleCancel() {
    setPreview(null)
  }

  const selectedCampaignName = campaigns.find((c) => c.id === selectedCampaignId)?.name

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
            <p className="mt-1 text-slate-500">
              {role === 'lead'
                ? 'Marketing lead — results & guardrails'
                : 'Autonomous Ad Manager Dashboard'}
            </p>
          </div>
          <RoleToggle role={role} onRoleChange={setRole} />
        </header>

        {role === 'lead' ? (
          <MarketingLeadDashboard
            campaigns={campaigns}
            loading={campaignsLoading}
            error={campaignsError}
            guardrails={guardrails}
            onGuardrailsSave={setGuardrails}
            impactStory={leadImpactStory}
            impactLoading={leadImpactLoading}
            impactError={leadImpactError}
          />
        ) : (
          <>
            <GuardrailsPanel guardrails={guardrails} readOnly />

            <GoalInput onCampaignPreview={setPreview} />

            {preview && (
              <CampaignPreview
                campaign={preview}
                onApprove={handleApprove}
                onCancel={handleCancel}
                approving={approving}
              />
            )}

            <OptimizationSuggestions suggestions={suggestions} loading={campaignsLoading} />

            <CampaignGrid
              campaigns={campaigns}
              loading={campaignsLoading}
              error={campaignsError}
              selectedCampaignId={selectedCampaignId}
              onSelectCampaign={setSelectedCampaignId}
            />

            {(selectedCampaignId || impactLoading) && (
              <ImpactStoryPanel
                impactStory={impactStory}
                campaignName={selectedCampaignName}
                loading={impactLoading}
                error={impactError}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
