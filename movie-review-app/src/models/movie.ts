import mongoose, { Schema, Document } from 'mongoose'

export interface Review {
  User: string
  Rating: number
  Review: string
}

export interface Movie extends Document {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  averageRating?: number | string
  Reviews: { User: string; Rating: number; Review: string }[]
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: string
}

const ReviewSchema = new Schema<Review>({
  User: { type: String, required: true },
  Rating: { type: Number, required: true, min: 0, max: 10 },
  Review: { type: String, required: true },
})

const MovieSchema = new mongoose.Schema<Movie>({
  imdbID: { type: String, unique: true, required: true },
  Title: { type: String, required: true },
  Year: { type: String },
  Rated: { type: String },
  Released: { type: String },
  Runtime: { type: String },
  Genre: { type: String },
  Director: { type: String },
  Writer: { type: String },
  Actors: { type: String },
  Plot: { type: String },
  Language: { type: String },
  Country: { type: String },
  Awards: { type: String },
  Poster: { type: String },
  Metascore: { type: String },
  imdbRating: { type: String },
  imdbVotes: { type: String },
  Type: { type: String },
  DVD: { type: String },
  BoxOffice: { type: String },
  Production: { type: String },
  Website: { type: String },
  Response: { type: String },

  averageRating: { type: mongoose.Schema.Types.Mixed },
  Reviews: { type: [ReviewSchema], default: [] },
})

export default mongoose.models.Movie || mongoose.model<Movie>('Movie', MovieSchema)
