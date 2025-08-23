import { fileURLToPath, URL } from 'node:url'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import bodyParser from 'body-parser'
import tailwindcss from '@tailwindcss/vite'
import express from 'express'
import Movie from './src/models/movie'
import type { Review } from './src/types/review'
import mongoose from 'mongoose'

// export default defineConfig(({ mode }) => {
//   // Declaring "API" prototype endpoints. Todo: Run in Express instead. (Never mind, couldnt get express to work with vercel in the same instance as vite)
//   // const env = loadEnv(mode, process.cwd(), '')
//   const omdbKey = 'c33efd4e'
//   const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json')

//   const omdbProxyPlugin = (): Plugin => ({
//     name: 'vite:omdb-proxy-with-reviews',
//     configureServer(server) {
//       server.middlewares.use(bodyParser.json())

//       // GET  /api/reviews/:id review return the stored reviews
//       server.middlewares.use(async (req, res, next) => {
//         const getMatch = req.url?.match(/^\/api\/reviews\/([^/]+)$/)
//         if (req.method !== 'GET' || !getMatch) {
//           return next()
//         }

//         const imdbID = decodeURIComponent(getMatch[1])

//         let moviesDB: { imdbID: string; Reviews?: { User: string; Rating: number }[] }[] = []
//         try {
//           const txt = await fs.readFile(moviesPath, 'utf-8')
//           moviesDB = JSON.parse(txt)
//         } catch {
//           moviesDB = []
//         }

//         const movie = moviesDB.find((movie) => movie.imdbID === imdbID)
//         const reviews = movie ? movie.Reviews || [] : []

//         res.statusCode = 200
//         res.setHeader('Content-Type', 'application/json')
//         return res.end(JSON.stringify(reviews))
//       })

//       // GET /api/user/:username/reviews return all reviews made by user
//       server.middlewares.use(async (req, res, next) => {
//         const getMatch = req.url?.match(/^\/api\/reviews\/user\/([^/]+)$/)
//         if (req.method !== 'GET' || !getMatch) {
//           return next()
//         }

//         const username = decodeURIComponent(getMatch[1])

//         let moviesDB: {
//           title: string
//           Title: string
//           Review: string
//           Reviews?: { User: string; Rating: number; Review: string }[]
//         }[] = []
//         try {
//           const txt = await fs.readFile(moviesPath, 'utf-8')
//           moviesDB = JSON.parse(txt)
//         } catch {
//           moviesDB = []
//         }

//         const userReviews: Review[] = []
//         moviesDB.forEach((movie) => {
//           movie.Reviews?.forEach((review) => {
//             if (review.User === username) {
//               userReviews.push({
//                 Title: movie.Title,
//                 User: review.User,
//                 Rating: review.Rating,
//                 Review: review.Review,
//               })
//             }
//           })
//         })

//         res.statusCode = 200
//         res.setHeader('Content-Type', 'application/json')
//         return res.end(JSON.stringify(userReviews))
//       })

//       // POST /api/movie/:id/review append to movieDB.json
//       server.middlewares.use(async (req, res, next) => {
//         const postMatch = req.url?.match(/^\/api\/reviews\/post\/([^/]+)$/)
//         if (req.method !== 'POST' || !postMatch) {
//           return next()
//         }
//         const imdbID = decodeURIComponent(postMatch[1])
//         // Fix req parsing
//         const { User, Rating, Review } = (req as any).body || {}

//         if (
//           typeof User !== 'string' ||
//           typeof Review !== 'string' ||
//           typeof Rating !== 'number' ||
//           Rating < 0 ||
//           Rating > 10
//         ) {
//           res.statusCode = 400
//           return res.end('Invalid payload')
//         }

//         let moviesDB: Movie[] = []
//         try {
//           const txt = await fs.readFile(moviesPath, 'utf-8')
//           moviesDB = JSON.parse(txt) as Movie[]
//         } catch {
//           moviesDB = []
//         }

//         const movieIndex = moviesDB.findIndex((movie) => movie.imdbID === imdbID)
//         if (movieIndex === -1) {
//           res.statusCode = 404
//           return res.end('Movie not found')
//         }

//         const movie = moviesDB[movieIndex]
//         movie.Reviews = movie.Reviews || []

//         if (movie.Reviews.some((review) => review.User === User)) {
//           res.statusCode = 409
//           return res.end('User has already reviewed this movie')
//         }

//         movie.Reviews.push({ User, Rating, Review })

//         try {
//           await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8')
//         } catch (e: unknown) {
//           console.error('Failed to write moviesDB.json:', e)
//           res.statusCode = 500
//           return res.end('Could not save review')
//         }

//         res.statusCode = 204
//         return res.end()
//       })

//       // GET  /api/movie/:imdbID detailed movie information from OMDB
//       server.middlewares.use(async (req, res, next) => {
//         if (!req.url?.startsWith('/api/movie/') || req.method !== 'GET') {
//           return next()
//         }
//         const imdbID = req.url.replace(/^\/api\/movie\//, '').split('?')[0]
//         if (!imdbID) {
//           res.statusCode = 400
//           return res.end(JSON.stringify({ error: 'Missing imdbID' }))
//         }
//         if (!omdbKey) {
//           res.statusCode = 500
//           return res.end(JSON.stringify({ error: 'OMDB_KEY not set' }))
//         }

//         try {
//           const omdbRes = await fetch(
//             `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`,
//           )
//           const json = await omdbRes.json()

//           res.setHeader('Content-Type', 'application/json')
//           return res.end(JSON.stringify(json))
//         } catch (err: unknown) {
//           res.statusCode = 502
//           return res.end(JSON.stringify({ error: (err as Error).message }))
//         }
//       })

//       // POST add movie to database
//       server.middlewares.use(async (req, res, next) => {
//         const match = req.url?.match(/^\/api\/movie\/([^/]+)$/)

//         if (req.method !== 'POST' || !match) {
//           return next()
//         }

//         const imdbID = decodeURIComponent(match[1]).trim()

//         if (!imdbID) {
//           res.statusCode = 400
//           return res.end(JSON.stringify({ error: 'Missing imdbID in params' }))
//         }

//         if (!omdbKey) {
//           res.statusCode = 500
//           return res.end(JSON.stringify({ error: 'OMDB_KEY not set' }))
//         }

//         try {
//           let moviesDB: Movie[] = []
//           try {
//             const txt = await fs.readFile(moviesPath, 'utf-8')
//             moviesDB = JSON.parse(txt) as Movie[]
//           } catch {
//             moviesDB = []
//           }

//           let movie = moviesDB.find((m) => m.imdbID === imdbID)
//           if (movie) {
//             res.setHeader('Content-Type', 'application/json')
//             return res.end(JSON.stringify(movie))
//           }

//           const omdbRes = await fetch(
//             `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`,
//           )
//           const json = (await omdbRes.json()) as Movie

//           if (!json || json.Response === 'False') {
//             res.statusCode = 404
//             return res.end(JSON.stringify({ error: 'Movie not found in OMDb' }))
//           }

//           movie = { ...json, imdbID, Reviews: [] }
//           moviesDB.push(movie)

//           try {
//             await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8')
//           } catch (e: unknown) {
//             console.error('Failed to write moviesDB.json:', e)
//             res.statusCode = 500
//             return res.end('Could not save movie')
//           }

//           res.setHeader('Content-Type', 'application/json')
//           res.statusCode = 201
//           return res.end(JSON.stringify(movie))
//         } catch (err: unknown) {
//           res.statusCode = 502
//           return res.end(JSON.stringify({ error: (err as Error).message }))
//         }
//       })
//     },
//   })
let isConnected = false

async function connectToDatabase() {
  if (isConnected) return
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI not set')
  }
  await mongoose.connect(uri)
  isConnected = true
}

// Still attempting the middleware approach, since I really dont want to set up a separate backend for this small project. (and the delay on free Render etc)
export function expressPlugin(): Plugin {
  const omdbKey = process.env.OMDB_KEY

  return {
    name: 'vite:express',
    configureServer(server) {
      const app = express()

      app.use(bodyParser.json())

      // Simple test endpoint
      app.get('/api/test', (req, res) => {
        res.json({ message: 'test' })
      })

      // GET /api/movies/all return all movies in database
      app.get('/api/movies/all', async (req, res) => {
        try {
          await connectToDatabase()
          const movies = await Movie.find().lean()
          return res.status(200).json(movies)
        } catch (err: unknown) {
          console.error(err)
          return res.status(502).json({ error: (err as Error).message })
        }
      })

      // GET  /api/movie/:imdbID detailed movie information from OMDB
      app.get('/api/movie/:imdbID', async (req: { params: { imdbID: string } }, res) => {
        const imdbID = req.params.imdbID

        if (!imdbID) {
          return res.status(400).json({ error: 'Missing imdbID' })
        }

        if (!omdbKey) {
          return res.status(500).json({ error: 'OMDB_KEY not set' })
        }

        try {
          const omdbRes = await fetch(
            `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`,
          )
          const json = await omdbRes.json()
          return res.status(200).json(json)
        } catch (err: unknown) {
          console.error(err)
          return res.status(502).json({ error: (err as Error).message })
        }
      })

      app.post('/api/movie/:imdbID', async (req, res) => {
        const imdbID = req.params.imdbID

        if (!imdbID) {
          return res.status(400).json({ error: 'Missing imdbID' })
        }

        if (!omdbKey) {
          return res.status(500).json({ error: 'OMDB_KEY not set' })
        }
        try {
          await connectToDatabase()

          let movie = await Movie.findOne({ imdbID }).lean()

          if (movie) {
            return res.status(200).json(movie)
          }

          const omdbRes = await fetch(
            `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`,
          )
          const json = await omdbRes.json()
          // Todo: fix whatever this is
          movie = await Movie.create({ ...json, imdbID, Reviews: [] })
          return res.status(201).json(movie)
        } catch (err: unknown) {
          console.error(err)
          return res.status(502).json({ error: (err as Error).message })
        }
      })

      server.middlewares.use(app)
    },
  }
}

export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss(), expressPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
