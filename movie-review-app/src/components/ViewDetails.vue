<script setup lang="ts">
import { useFetch } from '@/composables/useFetch'
import { computed, ref } from 'vue'
import ViewReviews from './ViewReviews.vue'
import SubmitReview from './SubmitReview.vue'

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
const selectedMovieID = ref('')

const { data: movieData, loading, error } = useFetch<Movie>(
  computed(() => props.imdbID ? `/api/movie/${props.imdbID}` : '')
)

function onBack() {
  emit('close')
}

function openReviews(m: string) {
  selectedMovieID.value = m
}

</script>

<template>
  <div class="transform transition-all w-full h-full bg-primary p-0">
    <button
      class="bg-highlight border-solid p-2 text-white rounded-br-lg text-lg cursor-pointer relative transition duration-200 hover:bg-secondary"
      @click="onBack"
    >
    Close
    </button>
    <div class="p-2 flex-row">
      <div v-if="loading" class="text-highlight text-center">Loading…</div>
      <div v-else-if="error">{{ error }}</div>
      <template v-else-if="movieData">
        <div>
          <h1>{{ movieData.Title }} <small>({{ movieData.Year }})</small></h1>
          <p><strong>Director:</strong> {{ movieData.Director }}</p>
          <p><strong>Genre:</strong> {{ movieData.Genre }}</p>
          <p><strong>Plot:</strong> {{ movieData.Plot }}</p>
          <p><strong>Actors:</strong> {{ movieData.Actors }}</p>
          <p><strong>IMDB Rating:</strong> {{ movieData.imdbRating }} / 10</p>
        </div>
        <SubmitReview
          :imdbID=imdbID
          :Title=movieData.Title
        />
        <button @click="openReviews(props.imdbID)"
          style="cursor:pointer; display:flex; align-items:center;">
          View reviews
        </button>
      </template>
      <div
      v-if="selectedMovieID"
      class="overlay"
      @click.self="selectedMovieID = ''"
      >
        <ViewReviews
          :imdbID="selectedMovieID"
          @hide="selectedMovieID = ''"
        />
      </div>
    </div>
  </div>
</template>