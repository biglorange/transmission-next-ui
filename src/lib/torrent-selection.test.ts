import { expect, test } from "vitest"

import {
  areAllSelected,
  hasAnySelected,
  toggleAllSelection,
  togglePageSelection,
} from "./torrent-selection"

test("detects full and partial selections", () => {
  expect(areAllSelected([1, 2, 3], [1, 2])).toBe(true)
  expect(areAllSelected([1], [1, 2])).toBe(false)
  expect(areAllSelected([], [])).toBe(false)
  expect(hasAnySelected([5], [1, 2])).toBe(false)
  expect(hasAnySelected([2, 5], [1, 2])).toBe(true)
})

test("select all selects every id and clears when complete", () => {
  expect(toggleAllSelection([], [1, 2, 3])).toEqual([1, 2, 3])
  expect(toggleAllSelection([1], [1, 2, 3])).toEqual([1, 2, 3])
  expect(toggleAllSelection([1, 2, 3], [1, 2, 3])).toEqual([])
})

test("select page adds only that page and can remove it again", () => {
  expect(togglePageSelection([1], [2, 3])).toEqual([1, 2, 3])
  expect(togglePageSelection([1, 2, 3], [2, 3])).toEqual([1])
  expect(togglePageSelection([], [])).toEqual([])
})
