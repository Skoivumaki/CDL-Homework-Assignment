# Movie Review App

A movie review application built with **Vue.js**.
It integrates with the [OMDb API](https://www.omdbapi.com/) to fetch additional details about movies (via IMDB data).

Users can:
- Post reviews for movies (with basic validation to discard multiple reviews under same name)
- View reviews from others
- Browse all users reviews across the site

---

## Technical Notes

- Built with **Vue.js** using Tailwind.

Note: Middleware endpoints were built with help of AI, (see file `vite.config.ts`) which aren’t suitable for production. I kept it simple and self-contained in a single instance with no external online database. There are however serverless functions files for use with Vercel, which I couldn't finish in time.

Estimated time spent on project: 18 hours  

---

## Project Setup

```sh
cd movie-review-app
```
Install:
```sh
npm install
```
Start:
```sh
npm run dev
```
Running at: [http://localhost:5173/](http://localhost:5173/)

---
<img width="1291" height="1348" alt="image" src="https://github.com/user-attachments/assets/aa5b4cc2-165d-4c54-9270-adef4900e2d1" />
