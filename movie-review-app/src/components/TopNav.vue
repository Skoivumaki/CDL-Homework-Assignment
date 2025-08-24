<script setup lang="ts">
import type { Movie } from '@/types/movie'

defineProps<{
  searchTerm: string,
  movies: Movie[],
  filteredMovies: Movie[]
}>()

const emit = defineEmits(['update:searchTerm'])

function updateSearchTerm(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    emit('update:searchTerm', event.target.value)
  }
}

</script>

<template>
  <div class="flex flex-col items-center m-2">
    <div class="flex flex-row items-center">
      <img src="@/assets/film-solid-full.svg" alt="Film Icon" class="w-10" />
      <h1>Movie Review App</h1>
    </div>
    <input :value="searchTerm" @input="updateSearchTerm" type="text" placeholder="Search by Title or Director…"
      class="p-2 w-full max-w-md mb-4 bg-primary text-text focus:outline-2 focus:outline-offset-2 focus:outline-highlight" />
    <p class="flex text-3xl font-bold p-2">
      Showing {{ filteredMovies.length }} of {{ movies.length }} results
    </p>
  </div>
</template>