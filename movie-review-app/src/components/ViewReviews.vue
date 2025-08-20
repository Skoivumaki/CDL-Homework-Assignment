<script setup lang="ts">
import { useFetch } from '@/composables/useFetch';
import { computed, ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import type { Review } from '@/types/review'

// For consistancy with other components props should be just defineProps
const props = defineProps<{ imdbID: string }>()

const { data: reviewData, loading, error } = useFetch<Review[]>(
  computed(() => props.imdbID ? `/api/movie/${props.imdbID}/review` : '')
)

const userReviews = ref<Review[] | null>(null);
const userLoading = ref(false);
const userError = ref<string | null>(null);
const isVisible = ref(true);
const activeUser = ref<string | null>(null)

async function fetchUserReviews(username: string) {
  userLoading.value = true;
  activeUser.value = username
  userError.value = null;
  try {
    const response = await fetch(`/api/user/${encodeURIComponent(username)}/reviews`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    userReviews.value = await response.json();
  } catch (err) {
    userError.value = (err as Error).message;
  } finally {
    userLoading.value = false;
  }
}

function closeUserReviews() {
  setTimeout(() => {
    activeUser.value = null
    userReviews.value = null;
  }, 500);
}

</script>

<template>
  <div v-if="isVisible" class="flex flex-col gap-4 rounded-xl">
    <div v-if="loading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <template v-else-if="reviewData">
      <div class="bg-secondary rounded-xl p-2 md-5" v-for="(review, index) in reviewData" :key="index">
        <div class="flex flex-row justify-between">
          <button @click="fetchUserReviews(review.User)">
            <h2 class="underline">{{ review.User }}</h2>
          </button>
          <div class="flex items-center">
            <label v-for="n in 5" :key="n" class="cursor-pointer transition-all duration-500"
              :class="review.Rating >= n ? 'text-yellow-400' : 'text-primary'">
              <span class="text-3xl">★</span>
            </label>
          </div>
        </div>
        <div>
          <p>
            {{ review.Review }}
          </p>
        </div>
        <!-- Todo: Move to a separate component. Also the active movies review shouldn't be shown here -->
        <div v-if="activeUser === review.User" v-on-click-outside="closeUserReviews"
          class="flex flex-col gap-4 bg-primary rounded-xl p-2 mt-5">
          <div class="text-highlight text-center border-b">Other reviews by {{ review.User }}</div>
          <div v-if="userLoading" class="status">Loading…</div>
          <div v-else-if="userError" class="status error">{{ userError }}</div>
          <template v-else-if="userReviews">
            <h2 v-for="(review, index) in userReviews" :key="index">
              <div class="flex flex-row justify-between">
                <button class="">{{ review.Title }}</button>
                <div class="flex items-center">
                  <label v-for="n in 5" :key="n" class="cursor-pointer transition-all duration-500"
                    :class="review.Rating >= n ? 'text-yellow-400' : 'text-secondary'">
                    <span class="text-3xl">★</span>
                  </label>
                </div>
              </div>
              <div>
                <p>{{ review.Review }}</p>
              </div>
            </h2>
            <h2 v-if="userReviews.length == 0">No reviews found</h2>
          </template>
        </div>
      </div>
      <h2 v-if="reviewData.length == 0">No reviews found</h2>
    </template>
  </div>
</template>