import { mockGenerateCampaignPreview } from '../src/api/mockGenerate.js'
import { mockFetchCampaigns, mockFetchImpactStory } from '../src/api/mockPerformance.js'

/**
 * Dev-only mock for campaign API routes.
 * Disabled when VITE_USE_REAL_API=true (proxy to backend on :8000).
 */
export function campaignsMockPlugin() {
  return {
    name: 'campaigns-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''

        // GET /campaigns/:id/impact-story
        const impactMatch = url.match(/^\/campaigns\/([^/]+)\/impact-story$/)
        if (req.method === 'GET' && impactMatch) {
          const data = mockFetchImpactStory(impactMatch[1])
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(data))
          return
        }

        // GET /campaigns
        if (req.method === 'GET' && url === '/campaigns') {
          const data = mockFetchCampaigns()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(data))
          return
        }

        // POST /campaigns/generate
        if (req.method === 'POST' && url === '/campaigns/generate') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { goal = '' } = JSON.parse(body || '{}')
              const campaign = mockGenerateCampaignPreview(goal)
              await new Promise((r) => setTimeout(r, 600))
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ campaign }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ message: 'Mock handler failed' }))
            }
          })
          return
        }

        next()
      })
    },
  }
}
