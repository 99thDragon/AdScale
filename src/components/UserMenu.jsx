import { useEffect, useRef, useState } from 'react'
import { CONNECTED_CHANNELS } from '../data/connectedChannels'
import { formatCurrency } from '../data/guardrails'
import { formatRelativeTime } from '../utils/relativeTime'
import { GoogleIcon, MetaIcon } from './icons/PlatformIcons'
import { btnGhost, tabularNum } from '../styles/ui'

const ROLE_LABELS = {
  manager: 'Ad Manager',
  lead: 'Marketing Lead',
}

const PROVIDER_CONFIG = {
  google: { label: 'Google Ads', Icon: GoogleIcon },
  facebook: { label: 'Meta Business', Icon: MetaIcon },
  meta: { label: 'Meta Business', Icon: MetaIcon },
}

function getDisplayName(user) {
  if (user.name && user.name !== 'Profile') return user.name
  const local = user.email?.split('@')[0]
  if (!local) return 'Account'
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className={`font-medium text-ink ${tabularNum}`}>{value}</span>
    </div>
  )
}

function UserMenu({ user, onSignOut, profileContext }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!user) return null

  const displayName = getDisplayName(user)
  const provider = PROVIDER_CONFIG[user.provider] ?? {
    label: user.provider ?? 'Connected',
    Icon: null,
  }
  const ProviderIcon = provider.Icon

  const connectedPlatforms = [...new Set(
    CONNECTED_CHANNELS.filter((c) => c.connected).map((c) => c.platform),
  )]
  const connectedChannelCount = CONNECTED_CHANNELS.filter((c) => c.connected).length

  const {
    role = 'manager',
    guardrails,
    activeCampaignCount = 0,
    campaignCount = 0,
    totalSpent = 0,
    lastUpdated = null,
  } = profileContext ?? {}

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition hover:border-primary/30 hover:bg-canvas"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink sm:inline">
          Profile
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-start gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
                  {ProviderIcon && <ProviderIcon size={14} />}
                  {provider.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-border px-4 py-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                Workspace
              </p>
              <div className="space-y-2">
                <ProfileRow label="Current role" value={ROLE_LABELS[role] ?? role} />
                <ProfileRow label="Active campaigns" value={String(activeCampaignCount)} />
                <ProfileRow label="Total campaigns" value={String(campaignCount)} />
                <ProfileRow label="Portfolio spend" value={formatCurrency(totalSpent)} />
              </div>
            </div>

            {guardrails && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                  Agent guardrails
                </p>
                <div className="space-y-2">
                  <ProfileRow label="Spend cap" value={formatCurrency(guardrails.spendCap)} />
                  <ProfileRow
                    label="Approval threshold"
                    value={formatCurrency(guardrails.approvalThreshold)}
                  />
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                Connected accounts
              </p>
              <p className="text-xs text-ink">
                {connectedPlatforms.join(' · ')}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {connectedChannelCount} ad channels linked
              </p>
            </div>
          </div>

          <div className="border-b border-border px-4 py-2.5 text-[11px] text-muted">
            Data synced {formatRelativeTime(lastUpdated)}
            {user.signedInAt && (
              <span className="block mt-0.5">
                Signed in {formatRelativeTime(new Date(user.signedInAt))}
              </span>
            )}
          </div>

          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className={`${btnGhost} w-full rounded-lg px-3 py-2 text-left hover:bg-canvas`}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
