<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import ViewDetails from './components/ViewDetails.vue'

// Todo: Eventually only store imdbID and in app reviews
const MOVIES_URL = '/movieDB.json'

interface Movie {
  imdbID: string
  Title: string
  Director?: string
  Year?: number | string
  Genre?: string
}

const movies       = ref<Movie[]>([])
const searchTerm   = ref('')
const selectedMovieID = ref('')

// Load mock list
watchEffect(async () => {
  try {
    const res = await fetch(MOVIES_URL)
    movies.value = await res.json()
  } catch (e) {
    console.error('failed to load movies:', e)
    movies.value = []
  }
})

const filteredMovies = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return movies.value
  return movies.value.filter(m => {
    const t = m.Title?.toLowerCase()    || ''
    const d = m.Director?.toLowerCase() || ''
    return t.includes(term) || d.includes(term)
  })
})

function openDetails(m: string) {
  selectedMovieID.value = m
}

</script>

<template>

  <!--
  Todo: Move 'Movie List' to its own component
  -->
  <h1>Movie List</h1>

  <input
    v-model="searchTerm"
    type="text"
    placeholder="Search by Title or Director…"
    style="padding:0.5em; width:100%; max-width:400px; margin-bottom:1em;"
  />

  <p>Showing {{ filteredMovies.length }} of {{ movies.length }} movies</p>

  <ul style="list-style:none; padding:0;">
    <li
      v-for="movie in filteredMovies"
      :key="movie.imdbID"
      style="margin-bottom:1em;"
    >
      <button
        @click="openDetails(movie.imdbID)"
        style="all:unset; cursor:pointer; display:flex; align-items:center;"
      >
        <div>
          <strong>{{ movie.Title }}</strong>
          <span v-if="movie.Year">({{ movie.Year }})</span>
          <div v-if="movie.Director">Director: {{ movie.Director }}</div>
          <div v-if="movie.Genre">Genre: {{ movie.Genre }}</div>
        </div>
      </button>
    </li>
  </ul>

  <div
    v-if="selectedMovieID"
    class="overlay"
    @click.self="selectedMovieID = ''"
  >
    <ViewDetails
      :imdbID="selectedMovieID"
      @close="selectedMovieID = ''"
    />
  </div>
</template>

<style>
.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>