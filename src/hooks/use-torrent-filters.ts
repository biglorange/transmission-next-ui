"use client"
import { useMemo } from "react"
import { useI18n } from "@/lib/i18n-context"
import { useSessionState } from "@/hooks/use-session-state"
import type { Torrent } from "@/lib/rpc-types"
import {
  filterTorrents,
  getAvailableDownloadDirs,
  getAvailableLabels,
  getAvailableTrackers,
  type CompletionFilterValue,
  type ErrorFilterValue,
  type StalledFilterValue,
} from "@/lib/torrent-list-utils"

export interface TorrentFilterState {
  tracker: string[]
  dir: string[]
  label: string[]
  completion: CompletionFilterValue[]
  error: ErrorFilterValue[]
  stalled: StalledFilterValue[]
  noLabel: boolean
}

const EMPTY_FILTERS: TorrentFilterState = {
  tracker: [],
  dir: [],
  label: [],
  completion: [],
  error: [],
  stalled: [],
  noLabel: false,
}

function toggleFilterValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function useTorrentFilters(
  torrents: Torrent[],
  statusFilter: string | undefined,
  searchQuery: string,
  storageKey: string,
) {
  const { t } = useI18n()
  const [filters, setFilters] = useSessionState<TorrentFilterState>(
    `${storageKey}:filters`,
    EMPTY_FILTERS,
  )

  const trackers = useMemo(() => getAvailableTrackers(torrents), [torrents])

  const downloadDirs = useMemo(() => getAvailableDownloadDirs(torrents), [torrents])

  const availableLabels = useMemo(() => getAvailableLabels(torrents), [torrents])

  const filteredTorrents = useMemo(() => filterTorrents(torrents, {
    statusFilter,
    searchQuery,
    trackerFilter: filters.tracker,
    dirFilter: filters.dir,
    labelFilter: filters.label,
    completionFilter: filters.completion,
    errorFilter: filters.error,
    stalledFilter: filters.stalled,
    noLabelFilter: filters.noLabel,
    translateStatus: (statusKey) => t(statusKey),
  }), [torrents, statusFilter, filters, searchQuery, t])

  const toggleTracker = (host: string) => {
    setFilters((prev) => ({
      ...prev,
      tracker: toggleFilterValue(prev.tracker, host),
    }))
  }

  const toggleDir = (path: string) => {
    setFilters((prev) => ({
      ...prev,
      dir: toggleFilterValue(prev.dir, path),
    }))
  }

  const toggleLabel = (label: string) => {
    setFilters((prev) => ({
      ...prev,
      label: toggleFilterValue(prev.label, label),
    }))
  }

  const toggleCompletion = (value: CompletionFilterValue) => {
    setFilters((prev) => ({
      ...prev,
      completion: toggleFilterValue(prev.completion, value),
    }))
  }

  const toggleError = (value: ErrorFilterValue) => {
    setFilters((prev) => ({
      ...prev,
      error: toggleFilterValue(prev.error, value),
    }))
  }

  const toggleStalled = (value: StalledFilterValue) => {
    setFilters((prev) => ({
      ...prev,
      stalled: toggleFilterValue(prev.stalled, value),
    }))
  }

  const toggleNoLabel = () => {
    setFilters((prev) => ({ ...prev, noLabel: !prev.noLabel }))
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  return {
    trackerFilter: filters.tracker,
    dirFilter: filters.dir,
    labelFilter: filters.label,
    completionFilter: filters.completion,
    errorFilter: filters.error,
    stalledFilter: filters.stalled,
    noLabelFilter: filters.noLabel,
    toggleTracker,
    toggleDir,
    toggleLabel,
    toggleCompletion,
    toggleError,
    toggleStalled,
    toggleNoLabel,
    clearFilters,
    trackers,
    downloadDirs,
    availableLabels,
    filteredTorrents,
  }
}
