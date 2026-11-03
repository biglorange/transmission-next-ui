import { expect, test } from "vitest"

import {
  buildTorrentFileTree,
  collectDirectoryPaths,
  flattenTorrentFileTree,
  getSelectionState,
  toggleNodeSelection,
  type TorrentFileTreeDirectory,
} from "./torrent-file-tree"

const files = [
  {
    index: 0,
    name: "Bundle/Season 1/E01.mkv",
    length: 10,
    bytesCompleted: 10,
  },
  {
    index: 1,
    name: "Bundle/Season 1/E02.mkv",
    length: 20,
    bytesCompleted: 0,
  },
  { index: 2, name: "Bundle/cover.jpg", length: 30, bytesCompleted: 0 },
]

test("builds a directory tree, strips a shared root and aggregates sizes", () => {
  const tree = buildTorrentFileTree(files)

  expect(tree.map((node) => [node.type, node.name])).toEqual([
    ["directory", "Season 1"],
    ["file", "cover.jpg"],
  ])

  const season = tree[0] as TorrentFileTreeDirectory

  expect(season.path).toBe("Bundle/Season 1")
  expect(season.fileIndexes).toEqual([0, 1])
  expect(season.totalLength).toBe(30)
  expect(season.bytesCompleted).toBe(10)
  expect(season.children.map((node) => node.name)).toEqual([
    "E01.mkv",
    "E02.mkv",
  ])
})

test("keeps multiple top-level directories and nested paths", () => {
  const tree = buildTorrentFileTree([
    { index: 0, name: "Video/movie.mkv", length: 10, bytesCompleted: 0 },
    { index: 1, name: "Subs/English/en.srt", length: 20, bytesCompleted: 0 },
  ])

  expect(tree.map((node) => node.name)).toEqual(["Subs", "Video"])

  const subs = tree[0] as TorrentFileTreeDirectory
  expect(subs.children.map((node) => node.name)).toEqual(["English"])
  expect(subs.fileIndexes).toEqual([1])
})

test("flattens only expanded directories", () => {
  const tree = buildTorrentFileTree(files)

  expect(flattenTorrentFileTree(tree).map(({ node }) => node.name)).toEqual([
    "Season 1",
    "E01.mkv",
    "E02.mkv",
    "cover.jpg",
  ])

  expect(
    flattenTorrentFileTree(tree, new Set(["Bundle/Season 1"])).map(
      ({ node }) => node.name,
    ),
  ).toEqual(["Season 1", "cover.jpg"])
})

test("collects every directory path for collapse-all", () => {
  const tree = buildTorrentFileTree([
    { index: 0, name: "Video/movie.mkv", length: 10, bytesCompleted: 0 },
    { index: 1, name: "Subs/English/en.srt", length: 20, bytesCompleted: 0 },
  ])

  expect(collectDirectoryPaths(tree)).toEqual(["Subs", "Subs/English", "Video"])
})

test("computes tri-state selection and toggles directory descendants", () => {
  const tree = buildTorrentFileTree(files)
  const season = tree[0] as TorrentFileTreeDirectory

  expect(getSelectionState(season, new Set())).toBe("unchecked")
  expect(getSelectionState(season, new Set([0]))).toBe("mixed")
  expect(getSelectionState(season, new Set([0, 1]))).toBe("checked")

  expect(toggleNodeSelection([2], season)).toEqual([0, 1, 2])
  expect(toggleNodeSelection([0, 1, 2], season)).toEqual([2])
})
