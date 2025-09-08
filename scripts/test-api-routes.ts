import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { setTimeout } from 'timers/promises'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3002

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, async () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      
      // Wait a moment for the server to be ready
      await setTimeout(2000)
      
      try {
        // Test the campaigns API route
        console.log('🔍 Testing campaigns API route...')
        const campaignsResponse = await fetch(`http://${hostname}:${port}/api/campaigns`)
        console.log(`✅ Campaigns API route test: ${campaignsResponse.status} ${campaignsResponse.statusText}`)
        
        // Test the leads API route
        console.log('🔍 Testing leads API route...')
        const leadsResponse = await fetch(`http://${hostname}:${port}/api/leads`)
        console.log(`✅ Leads API route test: ${leadsResponse.status} ${leadsResponse.statusText}`)
        
        console.log('🎉 All API routes are working correctly!')
        server.close()
        process.exit(0)
      } catch (error) {
        console.error('❌ API route test failed:', error)
        server.close()
        process.exit(1)
      }
    })
})