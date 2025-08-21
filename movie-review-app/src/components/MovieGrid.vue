<script setup lang="ts">
import type { Movie } from '@/types/movie';
import ViewDetails from './ViewDetails.vue'
import { computed, ref } from 'vue';
import MovieTile from './MovieTile.vue';

const props = defineProps<{
  filteredMovies: Movie[]
}>()

const selectedMovieID = ref('')
const isViewVisible = ref(false)

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

const moviesWithRatings = computed(() => {
  return props.filteredMovies.map(movie => {
    const reviews = movie.Reviews || []
    const totalRating = reviews.reduce((sum, review) => sum + review.Rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
    return {
      ...movie,
      averageRating: averageRating.toFixed(1)
    }
  })
})

</script>

<template>
  <div class="flex flex-row h-full">
    <ul class="flex flex-wrap gap-10 list-none transition-all duration-500 w-full min-w-170 h-fit px-2 justify-center">
      <li v-for="movie in moviesWithRatings" :key="movie.imdbID" class="flex mb-2 transition-transform duration-500">
        <button @click="openDetails(movie.imdbID || 'tt0111161')"
          class="bg-primary hover:outline-2 hover:outline-highlight shadow-md text-white font-bold p-3 rounded min-w-60">
          <MovieTile :movie="movie" />
        </button>
      </li>
    </ul>
    <Transition name="transitionWidth">
      <div v-if="isViewVisible" @click.self="closeDetails" class="overflow-hidden sticky top-0 w-full h-screen">
        <ViewDetails :imdbID="selectedMovieID"
          :averageReview="moviesWithRatings.find(movie => movie.imdbID === selectedMovieID)?.averageRating"
          @close="closeDetails" class="w-full" />
      </div>
    </Transition>
  </div>
</template>