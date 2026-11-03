import { useLayoutEffect } from "react"

const SCROLL_CONTAINER_ID = "app-scroll-container"
const STORAGE_PREFIX = "transmission-next-ui:scroll:"

function getScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null
  return document.getElementById(SCROLL_CONTAINER_ID)
}

/**
 * Keeps the main scroll container at the same position when a list view is
 * remounted after visiting a torrent detail page.
 *
 * The listener is attached in a layout effect so it is removed before the
 * browser clamps the scroll position of the newly rendered route.
 */
export function useScrollRestoration(key: string, ready: boolean) {
  useLayoutEffect(() => {
    const container = getScrollContainer()
    if (!container) return

    const storageKey = `${STORAGE_PREFIX}${key}`
    let frame = 0

    const save = () => {
      try {
        window.sessionStorage.setItem(storageKey, String(container.scrollTop))
      } catch {
        // Ignore unavailable storage.
      }
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        save()
      })
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      container.removeEventListener("scroll", handleScroll)
    }
  }, [key])

  useLayoutEffect(() => {
    const container = getScrollContainer()
    if (!container) return

    let saved = 0
    try {
      saved = Number(
        window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`) ?? 0,
      )
    } catch {
      saved = 0
    }

    if (!Number.isFinite(saved) || saved <= 0) {
      // No saved position for this view: start at the top instead of
      // inheriting the scroll offset of the previous route.
      container.scrollTop = 0
      return
    }

    if (!ready) return

    let attempts = 0
    let frame = 0

    const restore = () => {
      container.scrollTop = saved
      attempts += 1

      // The list can still be settling (fonts, images); retry briefly.
      if (attempts < 3 && Math.abs(container.scrollTop - saved) > 1) {
        frame = window.requestAnimationFrame(restore)
      }
    }

    frame = window.requestAnimationFrame(restore)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [key, ready])
}
