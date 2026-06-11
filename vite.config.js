import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import aiHandler from './api/ai.js'

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    request.on('error', reject)
  })
}

function createJsonResponse(response) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      response.statusCode = this.statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(payload))
    }
  }
}

function localApiPlugin() {
  return {
    name: 'manifestation-local-api',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          request.body = await readRequestBody(request)
          await aiHandler(request, createJsonResponse(response))
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({
            error: 'Local AI endpoint failed',
            message: error?.message || 'Unknown error'
          }))
        }
      })
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), localApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
