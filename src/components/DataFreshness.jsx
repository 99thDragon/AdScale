import { useEffect, useState } from 'react'
import { formatRelativeTime } from '../utils/relativeTime'

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={spinning ? 'animate-spin' : ''}
    >
      <path
        d="M21 12a9 9 0 1 1-2.64-6.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 3v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DataFreshness({ lastUpdated, loading, onRefresh }) {
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const label = lastUpdated ? formatRelativeTime(lastUpdated) : 'not yet loaded'

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <span>Data updated {label}</span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh campaign data"
        title="Refresh data"
        className="rounded-md p-1 text-muted transition hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshIcon spinning={loading} />
      </button>
    </div>
  )
}

export default DataFreshness
