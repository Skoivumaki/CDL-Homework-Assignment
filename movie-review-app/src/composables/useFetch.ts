import { ref, watch, type Ref } from 'vue'

export function useFetch<T>(url: string | Ref<string>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null | unknown>(null)

  // Watch for URL changes and refetch
  watch(
    () => (typeof url === 'string' ? url : url.value),
    async (u) => {
      if (!u) return
      loading.value = true
      error.value = null
      try {
        const res = await fetch(u)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        data.value = (await res.json()) as T
      } catch (e: unknown) {
        error.value = e
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  return { data, loading, error }
}
