import { act, renderHook } from "@testing-library/react"
import { beforeEach, expect, test } from "vitest"

import { useSessionState } from "./use-session-state"

beforeEach(() => {
  window.sessionStorage.clear()
})

test("uses the initial value and persists updates", () => {
  const { result } = renderHook(() => useSessionState("test:value", 1))

  expect(result.current[0]).toBe(1)

  act(() => result.current[1](2))

  expect(result.current[0]).toBe(2)
  expect(
    JSON.parse(window.sessionStorage.getItem("test:value") ?? "null"),
  ).toBe(2)
})

test("restores a value written by an earlier mount", () => {
  window.sessionStorage.setItem(
    "test:restored",
    JSON.stringify({ page: 3 }),
  )

  const { result } = renderHook(() =>
    useSessionState("test:restored", { page: 1 }),
  )

  expect(result.current[0]).toEqual({ page: 3 })
})

test("falls back when stored JSON is invalid", () => {
  window.sessionStorage.setItem("test:broken", "{")

  const { result } = renderHook(() =>
    useSessionState("test:broken", "fallback"),
  )

  expect(result.current[0]).toBe("fallback")
})
