import { useState, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next =
          typeof value === 'function'
            ? (value as (prev: T) => T)(storedValue)
            : value
        setStoredValue(next)
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* localStorage quota exceeded — fail silently */
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}
