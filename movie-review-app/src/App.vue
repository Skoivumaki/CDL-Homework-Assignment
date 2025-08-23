<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Movie } from '@/types/movie'
import TopNav from './components/TopNav.vue'
import MovieGrid from './components/MovieGrid.vue'

const MOVIES_URL = '/api/movies/all'

const movies = ref<Movie[]>([])
const searchTerm = ref('')

// only fetch once on mount
onMounted(async () => {
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
    const t = m.Title?.toLowerCase() || ''
    const d = m.Director?.toLowerCase() || ''
    return t.includes(term) || d.includes(term)
  })
})
</script>

<template>
  <div class="h-full bg-secondary">
    <TopNav v-model:searchTerm="searchTerm" :movies="movies" :filteredMovies="filteredMovies" />
    <MovieGrid :filteredMovies="filteredMovies" />
  </div>
</template>