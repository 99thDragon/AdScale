import { mockGenerateDraft } from '../src/api/mockGenerate.js'

/**
 * Dev-only mock for POST /campaigns/generate.
 * Disabled when VITE_USE_REAL_API=true (proxy to backend on :8000).
 */
export function campaignsMockPlugin() {
  return {
    name: 'campaigns-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/campaigns/generate' || req.method !== 'POST') {
          return next()
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { goal = '' } = JSON.parse(body || '{}')
            const draft = mockGenerateDraft(goal)

            await new Promise((r) => setTimeout(r, 600))

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ draft }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ message: 'Mock handler failed' }))
          }
        })
      })
    },
  }
}
