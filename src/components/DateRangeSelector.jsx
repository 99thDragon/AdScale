import { useEffect, useRef, useState } from 'react'
import {
  DATE_RANGE_GROUPS,
  DATE_RANGE_OPTIONS,
  getDateRangeLabel,
  toggleDateRange,
} from '../data/dateRange'

function DateRangeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = value.length ? value : ['7d']

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

  function handleToggle(rangeId) {
    onChange(toggleDateRange(selected, rangeId))
  }

  const triggerLabel = getDateRangeLabel(selected)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-canvas"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <span className="max-w-[160px] truncate">{triggerLabel}</span>
        {selected.length > 1 && (
          <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {selected.length}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`text-muted transition ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label="Date range filter"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs font-semibold text-ink">Date range</p>
            <p className="text-[11px] text-muted">Select one or more periods to compare</p>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {DATE_RANGE_GROUPS.map((group) => {
              const options = DATE_RANGE_OPTIONS.filter((o) => o.group === group.id)
              if (options.length === 0) return null

              return (
                <div key={group.id} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {options.map((option) => {
                      const checked = selected.includes(option.id)
                      return (
                        <li key={option.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition hover:bg-canvas ${
                              checked ? 'bg-primary-soft/50 text-ink' : 'text-muted'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggle(option.id)}
                              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20"
                            />
                            <span>{option.label}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border px-3 py-2 text-[11px] text-muted">
            Metrics use the widest selected window.
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangeSelector
