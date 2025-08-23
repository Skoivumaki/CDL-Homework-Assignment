import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from './src/models/movie.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const env = dotenv.config().parsed || {}
const omdbKey = process.env.OMDB_KEY || env.OMDB_KEY
const mongoUri = process.env.MONGODB_URI || env.MONGODB_URI

const app = express()

app.use(express.static(path.join(__dirname, 'dist')))

// GET /api/movies/all return all movies in database
app.get('/api/movies/all', async (req, res) => {
  try {
    await connectToDatabase()
    const movies = await Movie.find().lean()
    return res.status(200).json(movies)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// GET  /api/movie/:imdbID detailed movie information from OMDB
app.get('/api/movie/:imdbID', async (req, res) => {
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
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// POST add movie to database by imdbID
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
    movie = await Movie.create({ ...json, imdbID, Reviews: [] })
    return res.status(201).json(movie)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// GET /api/reviews/:id return all reviews for movie with imdbID = id
app.get('/api/reviews/:id', async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ error: 'Missing id' })
  }

  try {
    await connectToDatabase()
    const movie = await Movie.findOne({ imdbID: id }).lean()
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' })
    }
    return res.status(200).json(movie.Reviews)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// POST /api/review/:id add a review for movie with imdbID = id
app.post('/api/reviews/post/:id', express.json(), async (req, res) => {
  const { id } = req.params
  const { User, Rating, Review } = req.body || {}

  if (!id) {
    return res.status(400).json({ error: 'Missing id' })
  }

  if (!User || !Rating || !Review) {
    return res.status(400).json({ error: 'Missing User, Rating or Review' })
  }

  try {
    await connectToDatabase()
    const movie = await Movie.findOne({ imdbID: id })
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' })
    }

    movie.Reviews.push({ User, Rating, Review })
    await movie.save()
    return res.status(201).json(movie.Reviews)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// GET /api/reviews/user/:username return all reviews by user with username
app.get('/api/reviews/user/:username', async (req, res) => {
  const { username } = req.params

  if (!username) {
    return res.status(400).json({ error: 'Missing username' })
  }

  try {
    await connectToDatabase()

    const movies = await Movie.find({ 'Reviews.User': username }).lean()

    const userReviews = movies.flatMap((movie) =>
      movie.Reviews.filter((review) => review.User === username).map((review) => ({
        Title: movie.Title,
        imdbID: movie.imdbID,
        User: review.User,
        Rating: review.Rating,
        Review: review.Review,
      })),
    )

    return res.status(200).json(userReviews)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: err.message })
  }
})

// Route all other requests to index.html (built vue app)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Express at http://localhost:${PORT}`)
})

// Establish MongoDB connection
let isConnected = false

async function connectToDatabase() {
  if (isConnected) return
  const uri = mongoUri
  if (!uri) {
    throw new Error('MONGODB_URI not set')
  }
  await mongoose.connect(uri)
  isConnected = true
}
