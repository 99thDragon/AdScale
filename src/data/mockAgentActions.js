/**
 * Recent automated agent actions per campaign (mock until backend is live).
 * @typedef {{ time: string, action: string, detail: string }} AgentAction
 */

/** @type {Record<string, AgentAction[]>} */
const MOCK_AGENT_ACTIONS = {
  '1': [
    { time: 'Today, 2:00 PM', action: 'Budget shift', detail: 'Moved 15% of spend from Instagram Stories to Facebook Feed after CTR outperformance.' },
    { time: 'Today, 9:30 AM', action: 'Bid adjusted', detail: 'Increased max CPC by 8% on top-performing ad set.' },
    { time: 'Yesterday, 4:15 PM', action: 'Audience expanded', detail: 'Added lookalike segment (1%) from past purchasers.' },
  ],
  '2': [
    { time: 'Today, 11:00 AM', action: 'Negative keywords', detail: 'Added 12 negative keywords — estimated savings $120/week.' },
    { time: 'Yesterday, 3:00 PM', action: 'Bid adjusted', detail: 'Lowered brand keyword bids by 5% due to high impression share.' },
  ],
  '3': [
    { time: 'Today, 2:00 PM', action: 'Bid adjusted', detail: 'Increased campaign bids +5% to maintain delivery against rising CPMs.' },
    { time: 'Today, 8:00 AM', action: 'Creative rotation', detail: 'Paused underperforming ad variant (CTR 0.9% vs. 3.1% account avg).' },
    { time: 'Yesterday, 6:45 PM', action: 'Pacing check', detail: 'On track to hit weekly cap — no throttle required.' },
  ],
  '4': [
    { time: '3 days ago', action: 'Campaign paused', detail: 'Paused by agent — budget exhausted for retargeting window.' },
  ],
  '5': [
    { time: 'Today, 1:30 PM', action: 'Day-parting', detail: 'Increased weekend budget allocation by 20% based on conversion lift.' },
    { time: 'Yesterday, 10:00 AM', action: 'Frequency cap', detail: 'Set frequency cap to 3x/day to reduce ad fatigue.' },
  ],
  '6': [
    { time: 'Today, 7:15 AM', action: 'Keyword bid', detail: 'Raised bids on 4 high-intent search terms (+12%).' },
    { time: 'Yesterday, 2:30 PM', action: 'Landing page signal', detail: 'Flagged LP bounce rate spike — creative refresh suggested.' },
  ],
}

/** @param {string} campaignId @returns {AgentAction[]} */
export function getAgentActions(campaignId) {
  return MOCK_AGENT_ACTIONS[campaignId] ?? [
    { time: 'Today', action: 'Monitoring', detail: 'Agent is watching performance — no automated changes yet.' },
  ]
}
