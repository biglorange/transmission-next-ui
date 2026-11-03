import { useEffect, useState, type Dispatch, type SetStateAction } from "react"

function resolveInitialValue<T>(value: T | (() => T)): T {
  return typeof value === "function" ? (value as () => T)() : value
}

/**
 * useState backed by sessionStorage.
 *
 * The value survives route changes (for example opening a torrent detail page
 * and going back) but is scoped to the current browser tab/session.
 */
export function useSessionState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return resolveInitialValue(initialValue)

    try {
      const stored = window.sessionStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored) as T
    } catch {
      // Corrupt JSON or unavailable storage: fall back to the initial value.
    }

    return resolveInitialValue(initialValue)
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private mode / quota errors should not break the UI.
    }
  }, [key, value])

  return [value, setValue]
}
