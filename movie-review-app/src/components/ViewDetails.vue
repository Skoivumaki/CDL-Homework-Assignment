<script setup lang="ts">
import { ref, watchEffect } from 'vue'

// Todo: Move types to own file
interface Movie {
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
  Type?: string
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  Response?: string
}

const props = defineProps<{ imdbID: string }>()
const emit  = defineEmits(['close'])

const movieData = ref<Movie | null>(null)
const loading   = ref(true)
const error     = ref<string | null>(null)

watchEffect(async () => {
  if (!props.imdbID) return
  loading.value = true
  error.value   = null
  console.log(import.meta.env.VITE_OMDB_KEY)

  // Todo: Figure a better way todo this without revealing secrets
  const url = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_KEY}&i=${props.imdbID}`
  try {
    const res  = await fetch(url)
    const json = await res.json()
    if (json.Response === 'False') {
      error.value = json.Error || 'Movie not found'
      movieData.value = null
    } else {
      movieData.value = json as Movie
    }
  }
  catch (e: any) {
    error.value = e.message || 'Fetch failed'
    movieData.value = null
  }
  finally {
    loading.value = false
  }
})

function onBack() {
  emit('close')
}
</script>

<template>
  <div class="modal">
    <button class="back" @click="onBack">← Back</button>

    <div v-if="loading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <template v-else-if="movieData">
      <h2>{{ movieData.Title }} <small>({{ movieData.Year }})</small></h2>
      <p><strong>Director:</strong> {{ movieData.Director }}</p>
      <p><strong>Genre:</strong> {{ movieData.Genre }}</p>
      <p><strong>Plot:</strong> {{ movieData.Plot }}</p>
      <p><strong>Actors:</strong> {{ movieData.Actors }}</p>
      <p><strong>imdbRating:</strong> {{ movieData.imdbRating }} / 10</p>
    </template>
  </div>
</template>

<style>
.modal {
  background: white;
  padding: 1.5em;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  position: relative;
}
.back {
  background: none;
  border: none;
  color: #42b883;
  font-size: 1em;
  cursor: pointer;
  position: absolute;
  top: 1em;
  left: 1em;
}
.status {
  padding: 2em 0;
  text-align: center;
  font-style: italic;
}
.status.error {
  color: red;
}
</style>