import path from 'node:path';
import fs from 'fs/promises';

const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json');

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const id  = req.query.imdbID;
  if (!id) {
    return res.status(400).json({ error: 'Missing movie ID' });
  }

  const { User, Rating, Review } = req.body || {};

  if (
    typeof User !== 'string' || 
    typeof Review !== 'string' || 
    typeof Rating !== 'number' || 
    Rating < 0 || 
    Rating > 10
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const txt = await fs.readFile(moviesPath, 'utf-8');
    const moviesDB = JSON.parse(txt);

    const movieIndex = moviesDB.findIndex((movie) => movie.imdbID === id);
    if (movieIndex === -1) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = moviesDB[movieIndex];
    movie.Reviews = movie.Reviews || [];

    if (movie.Reviews.some((review) => review.User === User)) {
      return res.status(409).json({ error: 'User has already reviewed this movie' });
    }

    movie.Reviews.push({ User, Rating, Review });

    await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8');
    
    return res.status(204).end();
  } catch (error) {
    console.error('Failed to write moviesDB.json:', error);
    return res.status(500).json({ error: 'Could not save review' });
  }
};