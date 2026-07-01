import { getHourlySpend } from '../data/mockSpendHourly'

function SpendSparkline({ campaignId }) {
  const data = getHourlySpend(campaignId)
  const max = Math.max(...data.map((d) => d.amount), 1)
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-muted">Last 24 hours</p>
        <p className="text-sm font-semibold text-ink">${total.toLocaleString()} spent</p>
      </div>
      <div className="mt-3 flex h-16 items-end gap-0.5" role="img" aria-label="24-hour spend chart">
        {data.map((d) => (
          <div
            key={d.hour}
            title={`${d.hour}: $${d.amount}`}
            className="min-w-0 flex-1 rounded-t bg-primary/70 transition hover:bg-primary"
            style={{ height: `${Math.max((d.amount / max) * 100, 8)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-subtle">
        <span>00:00</span>
        <span>12:00</span>
        <span>Now</span>
      </div>
    </div>
  )
}

export default SpendSparkline
