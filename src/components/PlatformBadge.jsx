import { GoogleIcon, MetaIcon } from './icons/PlatformIcons'
import { platformGoogle, platformMeta } from '../styles/ui'

const PLATFORM_CONFIG = {
  Meta: { icon: MetaIcon, style: platformMeta, shortLabel: 'Meta' },
  'Google Ads': { icon: GoogleIcon, style: platformGoogle, shortLabel: 'Google' },
}

function PlatformBadge({ platform, showLabel = true, compact = false }) {
  const config = PLATFORM_CONFIG[platform]
  const Icon = config?.icon

  if (!config || !Icon) {
    return <span className="text-sm text-muted">{platform}</span>
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${
        compact ? 'px-1.5 py-1' : 'px-2 py-1 text-xs'
      } ${config.style}`}
      title={platform}
    >
      <Icon size={compact ? 16 : 18} />
      {showLabel && <span>{config.shortLabel}</span>}
    </span>
  )
}

export default PlatformBadge
