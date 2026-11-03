import { expect, test } from "vitest"
import {
  filterTorrents,
  getAvailableDownloadDirs,
  getAvailableLabels,
  getAvailableTrackers,
  getTorrentSortValue,
  isTorrentCompleted,
  sortTorrents,
} from "./torrent-list-utils.ts"
import type { Torrent } from "./rpc-types.ts"

const torrents: Torrent[] = [
  {
    id: 1,
    name: "Ubuntu ISO",
    status: 6,
    hashString: "a",
    totalSize: 1000,
    percentDone: 1,
    rateDownload: 0,
    rateUpload: 200,
    eta: -1,
    addedDate: 100,
    doneDate: 200,
    editDate: 400,
    downloadDir: "/downloads/iso",
    error: 0,
    errorString: "",
    uploadedEver: 300,
    downloadedEver: 1000,
    uploadRatio: 0.3,
    labels: ['{"text":"Linux"}', "ISO"],
    queuePosition: 0,
    isFinished: true,
    isPrivate: false,
    isStalled: false,
    peersConnected: 1,
    peersSendingToUs: 0,
    peersGettingFromUs: 1,
    trackerStats: [{ announce: "a", host: "ubuntu.example", seederCount: 1, leecherCount: 1, lastAnnounceSucceeded: true, lastAnnounceResult: "Success", isBackup: false }],
  },
  {
    id: 2,
    name: "Movie Remux",
    status: 4,
    hashString: "b",
    totalSize: 2000,
    percentDone: 0.4,
    rateDownload: 500,
    rateUpload: 20,
    eta: 120,
    addedDate: 200,
    doneDate: 0,
    editDate: 300,
    downloadDir: "/downloads/movies",
    error: 0,
    errorString: "",
    uploadedEver: 50,
    downloadedEver: 800,
    uploadRatio: 0.06,
    labels: ['{"text":"Movie"}', "4K"],
    queuePosition: 1,
    isFinished: false,
    isPrivate: false,
    isStalled: false,
    peersConnected: 5,
    peersSendingToUs: 3,
    peersGettingFromUs: 1,
    trackerStats: [{ announce: "b", host: "movies.example", seederCount: 1, leecherCount: 1, lastAnnounceSucceeded: true, lastAnnounceResult: "Success", isBackup: false }],
  },
  {
    id: 3,
    name: "Paused Archive",
    status: 0,
    hashString: "c",
    totalSize: 1500,
    percentDone: 0.8,
    rateDownload: 0,
    rateUpload: 0,
    eta: -1,
    addedDate: 150,
    doneDate: 0,
    editDate: 100,
    downloadDir: "/downloads/archive",
    error: 0,
    errorString: "",
    uploadedEver: 0,
    downloadedEver: 1200,
    uploadRatio: 0,
    labels: ["Archive"],
    queuePosition: 2,
    isFinished: false,
    isPrivate: false,
    isStalled: true,
    peersConnected: 0,
    peersSendingToUs: 0,
    peersGettingFromUs: 0,
    trackerStats: [{ announce: "c", host: "archive.example", seederCount: 1, leecherCount: 1, lastAnnounceSucceeded: false, lastAnnounceResult: "Timeout", isBackup: false }],
  },
]

const translateStatus = (value: string) => ({
  "status.stopped": "Stopped",
  "status.download": "Downloading",
  "status.seed": "Seeding",
  "status.check": "Checking",
  "status.check_wait": "Queued for verification",
  "status.download_wait": "Queued to download",
  "status.seed_wait": "Queued to seed",
}[value] ?? value)

test("collection helpers expose trackers, dirs, and labels", () => {
  expect(getAvailableTrackers(torrents)).toEqual(["archive.example", "movies.example", "ubuntu.example"])
  expect(getAvailableDownloadDirs(torrents)).toEqual(["/downloads/archive", "/downloads/iso", "/downloads/movies"])
  expect(getAvailableLabels(torrents)).toEqual(["4K", "Archive", "ISO", "Linux", "Movie"])
})

test("filterTorrents supports semantic status filters and label/tracker/search filters", () => {
  expect(filterTorrents(torrents, { statusFilter: "active", translateStatus }).map(({ id }) => id)).toEqual([1, 2])
  expect(filterTorrents(torrents, { statusFilter: "seeding", translateStatus }).map(({ id }) => id)).toEqual([1])
  expect(filterTorrents(torrents, { labelFilter: ["Movie"], translateStatus }).map(({ id }) => id)).toEqual([2])
  expect(filterTorrents(torrents, { trackerFilter: ["archive.example"], translateStatus }).map(({ id }) => id)).toEqual([3])
  expect(filterTorrents(torrents, { searchQuery: "ubuntu", translateStatus }).map(({ id }) => id)).toEqual([1])
})

test("filterTorrents supports completion, error, stalled and no-label filters", () => {
  expect(
    filterTorrents(torrents, {
      completionFilter: ["completed"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([1])
  expect(
    filterTorrents(torrents, {
      completionFilter: ["incomplete"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([2, 3])
  expect(
    filterTorrents(torrents, {
      completionFilter: ["completed", "incomplete"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([1, 2, 3])

  const withError = torrents.map((torrent) =>
    torrent.id === 2
      ? { ...torrent, error: 3, errorString: "No space left on device" }
      : torrent,
  )
  expect(
    filterTorrents(withError, {
      errorFilter: ["error"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([2])
  expect(
    filterTorrents(withError, {
      errorFilter: ["no-error"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([1, 3])

  expect(
    filterTorrents(torrents, {
      stalledFilter: ["stalled"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([3])
  expect(
    filterTorrents(torrents, {
      stalledFilter: ["not-stalled"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([1, 2])

  const withoutLabels = torrents.map((torrent) =>
    torrent.id === 3 ? { ...torrent, labels: [] } : torrent,
  )
  expect(
    filterTorrents(withoutLabels, {
      noLabelFilter: true,
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([3])
  expect(
    filterTorrents(withoutLabels, {
      labelFilter: ["Movie"],
      noLabelFilter: true,
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([2, 3])

  expect(
    filterTorrents(torrents, {
      completionFilter: ["incomplete"],
      stalledFilter: ["stalled"],
      translateStatus,
    }).map(({ id }) => id),
  ).toEqual([3])
})

test("isTorrentCompleted falls back to percentDone", () => {
  expect(isTorrentCompleted(torrents[0])).toBe(true)
  expect(isTorrentCompleted(torrents[1])).toBe(false)
  expect(
    isTorrentCompleted({ ...torrents[1], isFinished: false, percentDone: 1 }),
  ).toBe(true)
})

test("sortTorrents sorts by regular and derived fields", () => {
  expect(sortTorrents(torrents, { key: "addedDate", direction: "asc" }).map(({ id }) => id)).toEqual([1, 3, 2])
  expect(sortTorrents(torrents, { key: "labels", direction: "asc" }).map(({ id }) => id)).toEqual([3, 1, 2])
  expect(getTorrentSortValue(torrents[0], "labels")).toBe("Linux\u0000ISO")
})
