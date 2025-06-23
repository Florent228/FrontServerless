import { ref, watch, type Ref } from 'vue'

export const useDebounce = <T>(value: Ref<T>, delay = 300) => {
  const debouncedValue = ref<T>(value.value) as Ref<T>
  let timeoutId: number | null = null

  watch(
    value,
    (newValue) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        debouncedValue.value = newValue
        timeoutId = null
      }, delay)
    },
    { immediate: true }
  )

  return debouncedValue
}

// Fonction debounce simple
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
} 