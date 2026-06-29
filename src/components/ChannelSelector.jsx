import { CONNECTED_CHANNELS } from '../data/connectedChannels'

function ChannelSelector({ selectedIds, onChange }) {
  const connected = CONNECTED_CHANNELS.filter((c) => c.connected)
  const byPlatform = connected.reduce((acc, ch) => {
    if (!acc[ch.platform]) acc[ch.platform] = []
    acc[ch.platform].push(ch)
    return acc
  }, /** @type {Record<string, typeof CONNECTED_CHANNELS>} */ ({}))

  function toggle(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Launch channels
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Select which connected channels to launch this campaign on.
        </p>
      </div>
      {Object.entries(byPlatform).map(([platform, channels]) => (
        <div key={platform}>
          <p className="mb-2 text-sm font-medium text-slate-700">{platform}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {channels.map((ch) => (
              <label
                key={ch.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                  selectedIds.includes(ch.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(ch.id)}
                  onChange={() => toggle(ch.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-800">{ch.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {selectedIds.length === 0 && (
        <p className="text-sm text-amber-700">Select at least one channel to launch.</p>
      )}
    </div>
  )
}

export default ChannelSelector
