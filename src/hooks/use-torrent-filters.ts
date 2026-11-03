"use client"
import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n-context"
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

function toggleFilterValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function useTorrentFilters(
  torrents: Torrent[],
  statusFilter: string | undefined,
  searchQuery: string
) {
  const { t } = useI18n()
  const [trackerFilter, setTrackerFilter] = useState<string[]>([])
  const [dirFilter, setDirFilter] = useState<string[]>([])
  const [labelFilter, setLabelFilter] = useState<string[]>([])
  const [completionFilter, setCompletionFilter] = useState<CompletionFilterValue[]>([])
  const [errorFilter, setErrorFilter] = useState<ErrorFilterValue[]>([])
  const [stalledFilter, setStalledFilter] = useState<StalledFilterValue[]>([])
  const [noLabelFilter, setNoLabelFilter] = useState(false)

  const trackers = useMemo(() => getAvailableTrackers(torrents), [torrents])

  const downloadDirs = useMemo(() => getAvailableDownloadDirs(torrents), [torrents])

  const availableLabels = useMemo(() => getAvailableLabels(torrents), [torrents])

  const filteredTorrents = useMemo(() => filterTorrents(torrents, {
    statusFilter,
    searchQuery,
    trackerFilter,
    dirFilter,
    labelFilter,
    completionFilter,
    errorFilter,
    stalledFilter,
    noLabelFilter,
    translateStatus: (statusKey) => t(statusKey),
  }), [torrents, statusFilter, trackerFilter, dirFilter, labelFilter, completionFilter, errorFilter, stalledFilter, noLabelFilter, searchQuery, t])

  const toggleTracker = (host: string) => {
    setTrackerFilter(prev =>
      prev.includes(host)
        ? prev.filter(h => h !== host)
        : [...prev, host]
    )
  }

  const toggleDir = (path: string) => {
    setDirFilter(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const toggleLabel = (label: string) => {
    setLabelFilter(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const toggleCompletion = (value: CompletionFilterValue) => {
    setCompletionFilter((prev) => toggleFilterValue(prev, value))
  }

  const toggleError = (value: ErrorFilterValue) => {
    setErrorFilter((prev) => toggleFilterValue(prev, value))
  }

  const toggleStalled = (value: StalledFilterValue) => {
    setStalledFilter((prev) => toggleFilterValue(prev, value))
  }

  const toggleNoLabel = () => {
    setNoLabelFilter((prev) => !prev)
  }

  const clearFilters = () => {
    setTrackerFilter([])
    setDirFilter([])
    setLabelFilter([])
    setCompletionFilter([])
    setErrorFilter([])
    setStalledFilter([])
    setNoLabelFilter(false)
  }

  return {
    trackerFilter,
    dirFilter,
    labelFilter,
    completionFilter,
    errorFilter,
    stalledFilter,
    noLabelFilter,
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
