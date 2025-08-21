<script setup lang="ts">
import { useFetch } from '@/composables/useFetch'
import { computed, ref, watchEffect } from 'vue'
import ViewReviews from './ViewReviews.vue'
import SubmitReview from './SubmitReview.vue'
import { vOnClickOutside } from '@vueuse/components'
import type { Movie } from '@/types/movie'

const props = defineProps<{ imdbID: string, averageReview?: string }>()
const emit = defineEmits(['close'])
const selectedMovieID = ref('')
const isViewVisible = ref(false);

const { data: movieData, loading, error } = useFetch<Movie>(
  computed(() => props.imdbID ? `/api/movie/${props.imdbID}` : '')
)

const localRating = ref(0)

watchEffect(() => {
  if (!loading.value && movieData.value) {
    const reviews = movieData.value.Reviews
    if (!reviews || reviews.length === 0) {
      localRating.value = 0
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.Rating, 0)
      localRating.value = totalRating / reviews.length
    }
  }
})

function onBack() {
  emit('close')
}

function openReviews(m: string) {
  selectedMovieID.value = m
  isViewVisible.value = true;
}

function closeReviews() {
  isViewVisible.value = false;
  setTimeout(() => {
    selectedMovieID.value = ''
  }, 500);
}

</script>

<template>
  <div class="flex flex-col w-full h-full bg-primary">
    <button
      class="bg-highlight border-solid p-2 w-30 text-primary rounded-br-lg text-lg cursor-pointer relative transition duration-200 hover:bg-secondary"
      @click="onBack">
      Close
    </button>
    <div class="p-2 flex-row h-fit flex-shrink-0">
      <div v-if="loading" class="text-highlight text-center">Loading…</div>
      <div v-else-if="error">{{ error }}</div>
      <template v-else-if="movieData">
        <div class="max-h-80 overflow-hidden text-clip">
          <h1 class="truncate">{{ movieData.Title }} <small>({{ movieData.Year }})</small></h1>
          <p>{{ movieData.Plot }}</p>
          <p><strong>Director:</strong> {{ movieData.Director }}</p>
          <p><strong>Genre:</strong> {{ movieData.Genre }}</p>
          <p><strong>Rated:</strong> {{ movieData.Rated }}</p>
          <p><strong>Runtime:</strong> {{ movieData.Runtime }}</p>
          <p><strong>Release Date:</strong> {{ movieData.Released }}</p>
          <p><strong>Actors:</strong> {{ movieData.Actors }}</p>
          <p><strong>IMDB Rating:</strong> {{ movieData.imdbRating }} / 10</p>
          <p><strong>Movie Review App Rating:</strong> {{ averageReview == '0' ? 'No reviews' : averageReview + ' / 5'
            }}
          </p>
        </div>
        <SubmitReview :imdbID=imdbID :Title=movieData.Title />
      </template>
    </div>
    <div class="py-2 w-40 flex-shrink-0">
      <button v-if="!isViewVisible" @click="openReviews(props.imdbID)"
        class="bg-highlight p-2 text-primary rounded-br-lg text-lg hover:bg-secondary">
        View Reviews
      </button>
      <button v-if="isViewVisible" @click="closeReviews"
        class="bg-highlight p-2 text-primary rounded-br-lg text-lg hover:bg-secondary">
        Hide Reviews
      </button>
    </div>
    <div class="flex-1 overflow-hidden">
      <Transition name="transition">
        <div v-if="isViewVisible" v-on-click-outside="closeReviews"
          class="px-2 pb-2 w-full h-full overflow-y-auto overscroll-contain">
          <ViewReviews :imdbID="selectedMovieID" @hide="closeReviews" class="w-full" />
        </div>
      </Transition>
    </div>
  </div>
</template>