import { ref } from 'vue'

export function useSubmitReview(imdbID: string) {
  const loading = ref(false)
  const error = ref<null | string>(null)

  const submitReview = async (review: string, user: string, rating: number | null) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/movie/${imdbID}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Review: review, User: user, Rating: rating }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  return { submitReview, loading, error }
}
