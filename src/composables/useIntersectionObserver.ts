import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const isIntersecting = ref(false)
  const target = ref<HTMLElement | null>(null)
  
  let observer: IntersectionObserver | null = null

  const observe = (element: HTMLElement) => {
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.value = entry.isIntersecting
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)
  }

  const unobserve = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    if (target.value) {
      observe(target.value)
    }
  })

  onUnmounted(() => {
    unobserve()
  })

  return {
    isIntersecting,
    target,
    observe,
    unobserve,
  }
}

// Composable spécialisé pour les animations au scroll
export const useScrollAnimation = (threshold = 0.1) => {
  const { isIntersecting, target } = useIntersectionObserver({
    threshold,
    rootMargin: '50px',
  })

  return {
    isVisible: isIntersecting,
    animationTarget: target,
  }
} 