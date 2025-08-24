# Movie Review App

A movie review application built with **Vue.js**.
It integrates with the [OMDb API](https://www.omdbapi.com/) to fetch additional details about movies (via IMDB data).

Users can:
- Post reviews for movies (with basic validation to discard multiple reviews under same name)
- View reviews from others
- Browse all users reviews across the site

---

## Technical Notes

- Built with Vue.js using Tailwind.
- Running on Express where Vue built files are served.
- Data stored in MongoDB

Estimated time spent on project: 24 hours

## Development Log (after 21.8)

23.8 
- Received approval from AW to continue with the project
- Successfully deployed on Render with Express and MongoDB:
  [https://cdl-homework-assignment.onrender.com/](https://cdl-homework-assignment.onrender.com/)

24.8
- Component fixes and new hook
- Improved responsiveness across all devices
- Cleaned up the codebase
---

## Project Setup
Note: App isn't really meant to be run without enviroment variables for OMDB and Mongo, but there is a mock data file included for this. (see `App.vue`)
```sh
cd movie-review-app
```
Install:
```sh
npm install
```
Build Vue:
```sh
npm run build
```
Start:
```sh
npm run dev
```
Running at: [http://localhost:8080/](http://localhost:8080/)

---
<img width="1947" height="854" alt="image" src="https://github.com/user-attachments/assets/e5a07350-a4d3-4909-9b84-6d6166b506d0" />

