import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, vi } from "vitest"

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, String(value))
    },
  }
}

/**
 * Node 26 exposes a global `localStorage` accessor that returns undefined
 * without `--localstorage-file`, and jsdom's own storage is not always copied
 * onto the test globals. Fall back to an in-memory implementation so the app
 * and setup code can keep using localStorage.
 */
function resolveLocalStorage(): Storage {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage
    }
  } catch {
    // jsdom throws for opaque origins
  }

  try {
    if (globalThis.localStorage) {
      return globalThis.localStorage
    }
  } catch {
    // ignore the missing Node accessor
  }

  return createMemoryStorage()
}

const storage = resolveLocalStorage()

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storage,
})

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(() => {
  storage.clear()
  storage.setItem("transmission-locale", "en")
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)
