import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = ref(initialValue)
  
  // Initialize with stored value or initial value
  try {
    const item = window.localStorage.getItem(key)
    if (item) {
      storedValue.value = JSON.parse(item)
    }
  } catch (error) {
    console.log(error)
  }
  
  // Watch for changes and update localStorage
  watch(
    storedValue,
    (newValue) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.log(error)
      }
    },
    { deep: true }
  )
  
  return storedValue
}

export default useLocalStorage