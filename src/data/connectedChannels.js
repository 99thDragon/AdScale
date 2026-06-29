/** Mock connected ad-platform channels (OAuth-connected in production). */
export const CONNECTED_CHANNELS = [
  { id: 'meta-feed', platform: 'Meta', label: 'Facebook Feed', connected: true },
  { id: 'meta-stories', platform: 'Meta', label: 'Instagram Stories', connected: true },
  { id: 'meta-reels', platform: 'Meta', label: 'Instagram Reels', connected: true },
  { id: 'google-search', platform: 'Google Ads', label: 'Google Search', connected: true },
  { id: 'google-display', platform: 'Google Ads', label: 'Google Display', connected: true },
  { id: 'google-youtube', platform: 'Google Ads', label: 'YouTube', connected: false },
]

/** @param {string[]} channelIds */
export function getChannelLabels(channelIds) {
  return CONNECTED_CHANNELS.filter((c) => channelIds.includes(c.id)).map((c) => c.label)
}

/** Default selection: connected channels that match the preview's channel labels. */
export function defaultSelectedChannels(previewChannelLabels) {
  const connected = CONNECTED_CHANNELS.filter((c) => c.connected)
  const matched = connected.filter((c) => previewChannelLabels.includes(c.label))
  return (matched.length > 0 ? matched : connected.slice(0, 2)).map((c) => c.id)
}
