import path from 'node:path';
import fs from 'fs/promises';

const moviesPath = path.resolve(process.cwd(), 'public', 'movieDB.json');

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    const txt = await fs.readFile(moviesPath, 'utf-8');
    const moviesDB = JSON.parse(txt);

    const userReviews = [];
    moviesDB.forEach((movie) => {
      movie.Reviews?.forEach((review) => {
        if (review.User === username) {
          userReviews.push({
            Title: movie.Title,
            User: review.User,
            Rating: review.Rating,
            Review: review.Review,
          });
        }
      });
    });

    return res.status(200).json(userReviews);
  } catch (error) {
    return res.status(500).json({ error: ('Failed to read user reviews', error) });
  }
};