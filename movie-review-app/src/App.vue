<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import ViewDetails from './components/ViewDetails.vue'

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
const isViewVisible = ref(false);

// Load mock list (omdb api has limited usage for free)
watchEffect(async () => {
  try {
    const res = await fetch(MOVIES_URL)
    movies.value = await res.json()
  } catch (e) {
    console.error('Failed to load movies:', e)
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
  selectedMovieID.value = m;
  isViewVisible.value = true;
}

function closeDetails() {
  isViewVisible.value = false;
  setTimeout(() => {
    selectedMovieID.value = '';
  }, 500);
}

</script>

<template>
  <div class="h-full bg-secondary">'
    <div class="flex flex-col items-center">
      <div class="flex flex-row items-center">
        <img src="@/assets/film-solid-full.svg" alt="Film Icon" class="w-10" />
        <h1>Movie Review App</h1>
      </div>
    <input
      v-model="searchTerm"
      type="text"
      placeholder="Search by Title or Director…"
      class="p-2 w-full max-w-md mb-4 bg-primary text-text focus:outline-2 focus:outline-offset-2 focus:outline-highlight"
    />
    <p class="flex text-3xl font-bold p-2">
      Showing {{ filteredMovies.length }} of {{ movies.length }} results
    </p>
    </div>
    <div class="flex flex-row transition-all duration-500 h-full">
      <ul class="flex flex-wrap gap-10 list-none transition-all duration-500 w-full min-w-170 h-fit px-2 justify-center">
        <li
          v-for="movie in filteredMovies"
          :key="movie.imdbID"
          class="flex mb-2 transition-transform duration-500"
        >
          <button
            @click="openDetails(movie.imdbID)"
            class="bg-primary hover:bg-highlight duration-200 shadow-md text-white font-bold p-3 rounded min-w-60"
          >
            <div>
              <strong>{{ movie.Title }}</strong>
              <span v-if="movie.Year"> ({{ movie.Year }})</span>
              <div v-if="movie.Director">Director: {{ movie.Director }}</div>
              <div v-if="movie.Genre">Genre: {{ movie.Genre }}</div>
              <div class="flex aspect-w-2 aspect-h-3 w-full max-w-2xs bg-secondary items-center text-xs">
                <img src="@/assets/image.png" alt="Film Icon" class="w-full" />
              </div>
            </div>
          </button>
        </li>
      </ul>
      <div
        @click.self="closeDetails"
        :class="[
          'transition-all duration-500 overflow-hidden sticky top-0',
          isViewVisible ? 'w-full h-fit' : 'w-0 max-h-100 h-fit s'
        ]"
      >
        <ViewDetails
          v-if="selectedMovieID"
          :imdbID="selectedMovieID"
          @close="closeDetails"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>