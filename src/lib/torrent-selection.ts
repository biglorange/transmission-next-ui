export function areAllSelected(selectedIds: number[], ids: number[]): boolean {
  if (ids.length === 0) return false

  const selected = new Set(selectedIds)
  return ids.every((id) => selected.has(id))
}

export function hasAnySelected(selectedIds: number[], ids: number[]): boolean {
  const selected = new Set(selectedIds)
  return ids.some((id) => selected.has(id))
}

/**
 * Select every id, or clear the whole selection when all ids are already
 * selected. Used by the header checkbox and the "select all" action.
 */
export function toggleAllSelection(
  selectedIds: number[],
  ids: number[],
): number[] {
  return areAllSelected(selectedIds, ids) ? [] : Array.from(new Set(ids))
}

/**
 * Toggle only the ids on the current page and keep selections from other
 * pages untouched.
 */
export function togglePageSelection(
  selectedIds: number[],
  pageIds: number[],
): number[] {
  if (pageIds.length === 0) return selectedIds

  if (areAllSelected(selectedIds, pageIds)) {
    const page = new Set(pageIds)
    return selectedIds.filter((id) => !page.has(id))
  }

  return Array.from(new Set([...selectedIds, ...pageIds]))
}
