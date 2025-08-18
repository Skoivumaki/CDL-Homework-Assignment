<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useSubmitReview } from '@/composables/useSubmitReview';
import { useGetUser } from '@/composables/useGetUser';

export default defineComponent({
  props: {
    imdbID: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const user = ref('');
    const review = ref('');
    const rating = ref<number>(0);

    const { submitReview, loading, error } = useSubmitReview(props.imdbID);

    const { getUser, userData } = useGetUser()

    const handleSubmit = async () => {
      await getUser();
      user.value = userData.value
      if (user.value === '') {
        review.value = '';
        user.value = '';
        rating.value = 0;
      }

      await submitReview(review.value, user.value, rating.value);
      if (!error.value) {
        review.value = '';
        user.value = '';
        rating.value = 0;
      }
    };

    return { review, user, rating, handleSubmit, loading, error };
  },
});
</script>

<!-- Might still change the design, not sure if it looks good -->
<template>
  <div class="flex flex-col gap-4 bg-secondary rounded-xl p-2 mt-5">
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
      <div class="flex flex-col items-center justify-center gap-2">
        <h2 class="mr-2 font-medium">What would you rate the movie?</h2>
        <div class="flex">
          <label
            v-for="n in 5"
            :key="n"
            class="cursor-pointer transition-all duration-500 hover:text-yellow-400"
            :class="rating >= n ? 'text-yellow-400' : 'text-primary'"
          >
            <input
              v-model="rating"
              type="radio"
              class="hidden"
              :value="n"
              required
            />
            <span class="text-3xl">★</span>
          </label>
        </div>
      </div>

      <label class="flex flex-col">
        <textarea v-model="review"
          type="text"
          placeholder="Tell us your thoughts about the movie..."
          class="border bg-white p-2 rounded w-full"
          required>
        </textarea>
      </label>

      <p class="text-red-500 text-sm" v-if="error">{{ error }}</p>

      <button
        type="submit"
        class="bg-primary border-solid p-2 text-white rounded-lg text-lg duration-200 hover:outline-2 hover:outline-offset-2 hover:outline-highlight focus:bg-highlight"
        :disabled="loading"
      >
        Submit
      </button>
      <div v-if="loading" class="text-highlight">Submitting...</div>
    </form>
  </div>
</template>