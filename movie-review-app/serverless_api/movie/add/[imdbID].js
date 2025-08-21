import path from 'node:path';
import fs from 'fs/promises';

const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json');
const omdbKey = process.env.OMDB_KEY;

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imdbID } = req.query;
  
  if (!imdbID) {
    return res.status(400).json({ error: 'Missing imdbID in params' });
  }

  if (!omdbKey) {
    return res.status(500).json({ error: 'OMDB_KEY not set' });
  }

  try {
    const txt = await fs.readFile(moviesPath, 'utf-8');
    const moviesDB = JSON.parse(txt);

    let movie = moviesDB.find((m) => m.imdbID === imdbID);
    if (movie) {
      return res.status(200).json(movie);
    }

    const omdbRes = await fetch(
      `https://www.omdbapi.com/?apikey=${omdbKey}&i=${encodeURIComponent(imdbID)}&plot=short`
    );
    const json = await omdbRes.json();

    if (!json || json.Response === 'False') {
      return res.status(404).json({ error: 'Movie not found in OMDb' });
    }

    movie = { ...json, imdbID, Reviews: [] };
    moviesDB.push(movie);

    await fs.writeFile(moviesPath, JSON.stringify(moviesDB, null, 2), 'utf-8');

    return res.status(201).json(movie);
  } catch (error) {
    console.error('Failed to write moviesDB.json:', error);
    return res.status(500).json({ error: 'Could not save movie' });
  }
};