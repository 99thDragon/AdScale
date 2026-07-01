import { statusActive, statusOptimizing, statusPaused } from '../styles/ui'

const STATUS_CONFIG = {
  Active: { pill: statusActive, dot: 'bg-success', pulse: false },
  Optimizing: { pill: statusOptimizing, dot: 'bg-primary', pulse: true },
  Paused: { pill: statusPaused, dot: 'bg-subtle', pulse: false },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Paused

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.pill}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}

export default StatusBadge
