export interface Movie {
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
  Metascore?: string
  imdbRating?: string
  imdbVotes?: string
  imdbID?: string
  Reviews?: { User: string; Rating: number; Review: string }[]
  Type?: string
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  Response?: string
}