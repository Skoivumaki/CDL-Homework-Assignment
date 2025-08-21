import path from 'node:path';
import fs from 'fs/promises';

const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json');

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing movie ID' });
  }

  try {
    const txt = await fs.readFile(moviesPath, 'utf-8');
    const moviesDB = JSON.parse(txt);
    const movie = moviesDB.find((movie) => movie.imdbID === id);
    const reviews = movie ? movie.Reviews || [] : [];

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ error: ("Failed to read movie data", error) });
  }
};