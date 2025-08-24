import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile(breakpoint = 768) {
  // tailwind md
  const isMobile = ref(window.innerWidth < breakpoint)

  function checkMobile() {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => {
    window.addEventListener('resize', checkMobile)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return { isMobile }
}
