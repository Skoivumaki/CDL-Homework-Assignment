<script setup lang="ts">
import type { Movie } from '@/types/movie';
import ViewDetails from './ViewDetails.vue'
import { ref } from 'vue';
import MovieTile from './MovieTile.vue';

defineProps<{
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

</script>

<template>
  <div class="flex flex-row transition-all duration-500 h-full">
    <ul class="flex flex-wrap gap-10 list-none transition-all duration-500 w-full min-w-170 h-fit px-2 justify-center">
      <li v-for="movie in filteredMovies" :key="movie.imdbID" class="flex mb-2 transition-transform duration-500">
        <button @click="openDetails(movie.imdbID || 'tt0111161')"
          class="bg-primary hover:bg-highlight duration-200 shadow-md text-white font-bold p-3 rounded min-w-60">
          <MovieTile :movie="movie" />
        </button>
      </li>
    </ul>
    <Transition name="transitionWidth">
      <div v-if="isViewVisible" @click.self="closeDetails" class="overflow-hidden sticky top-0 w-full h-screen">
        <ViewDetails :imdbID="selectedMovieID" @close="closeDetails" class="w-full" />
      </div>
    </Transition>
  </div>
</template>