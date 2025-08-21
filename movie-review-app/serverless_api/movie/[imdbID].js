export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imdbID } = req.query

  const omdbKey = process.env.OMDB_KEY

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
    const data = await omdbRes.json()
    return res.status(201).json(data)
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
}
