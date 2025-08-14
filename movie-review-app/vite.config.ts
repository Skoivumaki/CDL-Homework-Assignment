import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, Plugin } from 'vite'
import vue         from '@vitejs/plugin-vue'
import vueJsx      from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import bodyParser  from 'body-parser'
import path from 'node:path'
import fs          from 'fs/promises'

export default defineConfig(({ mode }) => {

  // Declaring "API" prototype endpoints. Todo: Run in Express instead. Needs types.
  const env = loadEnv(mode, process.cwd(), '')
  const omdbKey = env.OMDB_KEY

  const localRatings: Record<string, { User: string; Rating: number }[]> = {}
  const reviewsPath = path.resolve(process.cwd(), 'public', 'reviewsDB.json')

  const omdbProxyPlugin = (): Plugin => ({
    name: 'vite:omdb-proxy-with-reviews',
    configureServer(server) {

      // GET  /api/movie/:id/review return the stored reviews
      server.middlewares.use(async (req, res, next) => {
        const getMatch = req.url?.match(/^\/api\/movie\/([^/]+)\/review$/)
        if (req.method !== 'GET' || !getMatch) {
          return next()
        }

        const imdbID = decodeURIComponent(getMatch[1])

        let reviewsDB: Record<string, { User: string; Rating: number }[]> = {}
        try {
          const txt = await fs.readFile(reviewsPath, 'utf-8')
          reviewsDB = JSON.parse(txt)
        }
        catch {
          reviewsDB = {}
        }

        const reviews = reviewsDB[imdbID] || []

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(reviews))
      })

      // POST /api/movie/:id/review append to reviewsDB.json
      server.middlewares.use(async (req, res, next) => {
        const postMatch = req.url?.match(/^\/api\/movie\/([^/]+)\/review$/)
        if (req.method !== 'POST' || !postMatch) {
          return next()
        }

        const imdbID = decodeURIComponent(postMatch[1])
        const { User, Rating } = (req as any).body || {}

        // Simple validation
        if (
          typeof User !== 'string' ||
          typeof Rating   !== 'number' ||
          Rating < 0 || Rating > 10
        ) {
          res.statusCode = 400
          return res.end('Invalid payload')
        }

        let reviewsDB: Record<string, { User: string; Rating: number }[]> = {}
        try {
          const txt = await fs.readFile(reviewsPath, 'utf-8')
          reviewsDB = JSON.parse(txt)
        } catch (e) {
          reviewsDB = {}
        }

        reviewsDB[imdbID] = reviewsDB[imdbID] || []
        reviewsDB[imdbID].push({ User, Rating })

        try {
          await fs.writeFile(
            reviewsPath,
            JSON.stringify(reviewsDB, null, 2),
            'utf-8'
          )
        } catch (e: any) {
          console.error('Failed to write reviewsDB.json:', e)
          res.statusCode = 500
          return res.end('Could not save review')
        }

        res.statusCode = 204
        return res.end()
      })

      // GET  /api/movie/:imdbID proxy to OMDB, then append localRatings
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/movie/') || req.method !== 'GET') {
          return next()
        }
        const imdbID = req.url.replace(/^\/api\/movie\//, '').split('?')[0]
        if (!imdbID) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing imdbID' }))
        }
        if (!omdbKey) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'OMDB_KEY not set' }))
        }

        try {
          const omdbRes = await fetch(
            `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`
          )
          const json = await omdbRes.json()

          ;(json as any).localRatings = localRatings[imdbID] || []

          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify(json))
        }
        catch (err: any) {
          res.statusCode = 502
          return res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  })

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      omdbProxyPlugin()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})