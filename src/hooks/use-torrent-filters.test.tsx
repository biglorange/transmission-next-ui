import type { ReactNode } from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, expect, test } from "vitest"

import { I18nProvider } from "@/lib/i18n-context"
import type { Torrent } from "@/lib/rpc-types"
import { useTorrentFilters } from "./use-torrent-filters"

const torrents: Torrent[] = []

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

beforeEach(() => {
  window.sessionStorage.clear()
})

test("restores filter state for the same list view", () => {
  window.sessionStorage.setItem(
    "test:list:filters",
    JSON.stringify({
      tracker: [],
      dir: [],
      label: ["movies"],
      completion: [],
      error: [],
      stalled: [],
      noLabel: false,
    }),
  )

  const { result } = renderHook(
    () => useTorrentFilters(torrents, undefined, "", "test:list"),
    { wrapper },
  )

  expect(result.current.labelFilter).toEqual(["movies"])
})

test("persists filter changes and keeps views isolated", () => {
  const first = renderHook(
    () => useTorrentFilters(torrents, undefined, "", "test:view-a"),
    { wrapper },
  )

  act(() => first.result.current.toggleLabel("movies"))

  expect(first.result.current.labelFilter).toEqual(["movies"])
  expect(
    JSON.parse(
      window.sessionStorage.getItem("test:view-a:filters") ?? "null",
    ).label,
  ).toEqual(["movies"])

  first.unmount()

  const second = renderHook(
    () => useTorrentFilters(torrents, undefined, "", "test:view-b"),
    { wrapper },
  )

  expect(second.result.current.labelFilter).toEqual([])
})
