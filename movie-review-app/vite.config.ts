import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, Plugin } from 'vite'
import vue         from '@vitejs/plugin-vue'
import vueJsx      from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'node:path'
import fs          from 'fs/promises'
import bodyParser from 'body-parser'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
interface Movie {
  Title: string
  Year: string
  Rated?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Writer?: string
  Actors?: string
  Plot?: string
  Language?: string
  Country?: string
  Awards?: string
  Poster?: string
  Reviews?: { User: string; Review: string; Rating: number }[];
  Metascore?: string
  imdbRating?: string
  imdbVotes?: string
  imdbID?: string
  Type?: string
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  Response?: string
}
  // Declaring "API" prototype endpoints. Todo: Run in Express instead. Needs types.
  const env = loadEnv(mode, process.cwd(), '')
  const omdbKey = env.OMDB_KEY

  const localRatings: Record<string, { User: string; Rating: number }[]> = {}
  const moviesDB: Record<string, any> = {}
  const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json')

  const omdbProxyPlugin = (): Plugin => ({
    name: 'vite:omdb-proxy-with-reviews',
    configureServer(server) {

      server.middlewares.use(bodyParser.json())

      // GET  /api/movie/:id/review return the stored reviews
      server.middlewares.use(async (req, res, next) => {
        const getMatch = req.url?.match(/^\/api\/movie\/([^/]+)\/review$/);
        if (req.method !== 'GET' || !getMatch) {
          return next();
        }

        const imdbID = decodeURIComponent(getMatch[1]);

        let moviesDB: { imdbID: string, Reviews?: { User: string; Rating: number }[] }[] = [];
        try {
          const txt = await fs.readFile(moviesPath, 'utf-8');
          moviesDB = JSON.parse(txt);
        } catch {
          moviesDB = [];
        }

        const movie = moviesDB.find(movie => movie.imdbID === imdbID);
        const reviews = movie ? movie.Reviews || [] : [];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(reviews));
      });

      // GET /api/user/:username/reviews return all reviews made by user
      server.middlewares.use(async (req, res, next) => {
        const getMatch = req.url?.match(/^\/api\/user\/([^/]+)\/reviews$/);
        if (req.method !== 'GET' || !getMatch) {
          return next();
        }

        const username = decodeURIComponent(getMatch[1]);

        let moviesDB: { title: string, Title: string, Reviews?: { User: string; Rating: number }[] }[] = [];
        try {
          const txt = await fs.readFile(moviesPath, 'utf-8');
          moviesDB = JSON.parse(txt);
        } catch {
          moviesDB = [];
        }

        const userReviews = [];
        moviesDB.forEach(movie => {
          movie.Reviews?.forEach(review => {
            if (review.User === username) {
              userReviews.push({ Title: movie.Title, ...review });
            }
          });
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        console.log(userReviews)
        return res.end(JSON.stringify(userReviews));
      });

      // POST /api/movie/:id/review append to movieDB.json
      server.middlewares.use(async (req, res, next) => {
        const postMatch = req.url?.match(/^\/api\/movie\/([^/]+)\/review$/);
        if (req.method !== 'POST' || !postMatch) {
          return next();
        }

        const imdbID = decodeURIComponent(postMatch[1]);
        const { User, Rating, Review } = (req as any).body || {};

        if (typeof User !== 'string' || typeof Review !== 'string' || typeof Rating !== 'number' || Rating < 0 || Rating > 10) {
          res.statusCode = 400;
          return res.end('Invalid payload');
        }

        let moviesDB: Movie[] = [];
        try {
          const txt = await fs.readFile(moviesPath, 'utf-8');
          moviesDB = JSON.parse(txt) as Movie[];
        } catch {
          moviesDB = [];
        }

        const movieIndex = moviesDB.findIndex(movie => movie.imdbID === imdbID);
        if (movieIndex === -1) {
          res.statusCode = 404;
          return res.end('Movie not found');
        }

        const movie = moviesDB[movieIndex];
        movie.Reviews = movie.Reviews || [];

        if (movie.Reviews.some(review => review.User === User)) {
          res.statusCode = 409;
          return res.end('User has already reviewed this movie');
        }

        movie.Reviews.push({ User, Rating, Review });

        try {
          await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8');
        } catch (e: any) {
          console.error('Failed to write moviesDB.json:', e);
          res.statusCode = 500;
          return res.end('Could not save review');
        }

        res.statusCode = 204;
        return res.end();
      });

      // GET  /api/movie/:imdbID detailed movie information from OMDB
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

          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify(json))
        }
        catch (err: any) {
          res.statusCode = 502
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // POST add movie to database
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/movie\/([^/]+)$/)

        if (req.method !== 'POST' || !match) {
          return next()
        }

        const imdbID = decodeURIComponent(match[1]).trim()

        if (!imdbID) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing imdbID in params' }))
        }

        if (!omdbKey) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'OMDB_KEY not set' }))
        }

        try {
          let moviesDB: Movie[] = []
          try {
            const txt = await fs.readFile(moviesPath, 'utf-8')
            moviesDB = JSON.parse(txt) as Movie[]
          } catch {
            moviesDB = []
          }

          let movie = moviesDB.find((m) => m.imdbID === imdbID)
          if (movie) {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify(movie))
          }

          const omdbRes = await fetch(
            `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`
          )
          const json = (await omdbRes.json()) as Movie

          if (!json || json.Response === 'False') {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Movie not found in OMDb' }))
          }

          movie = { ...json, imdbID, Reviews: [] }
          moviesDB.push(movie)

          try {
            await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8')
          } catch (e: any) {
            console.error('Failed to write moviesDB.json:', e)
            res.statusCode = 500
            return res.end('Could not save movie')
          }

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 201
          return res.end(JSON.stringify(movie))
        } catch (err: any) {
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
      omdbProxyPlugin(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})