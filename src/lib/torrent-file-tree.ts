import type { SelectableTorrentFile } from "./torrent-file-selection"

export type TorrentFileSelectionState = "checked" | "mixed" | "unchecked"

interface TorrentFileTreeBase {
  name: string
  path: string
  fileIndexes: number[]
  totalLength: number
  bytesCompleted: number
}

export interface TorrentFileTreeDirectory extends TorrentFileTreeBase {
  type: "directory"
  children: TorrentFileTreeNode[]
}

export interface TorrentFileTreeFile extends TorrentFileTreeBase {
  type: "file"
  file: SelectableTorrentFile
}

export type TorrentFileTreeNode = TorrentFileTreeDirectory | TorrentFileTreeFile

export interface FlatTorrentFileNode {
  node: TorrentFileTreeNode
  depth: number
}

interface MutableDirectory {
  name: string
  path: string
  children: Map<string, MutableDirectory>
  files: SelectableTorrentFile[]
}

function splitPath(name: string): string[] {
  return name
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part.length > 0)
}

function normalizePath(name: string): string {
  return splitPath(name).join("/")
}

/**
 * Torrents are usually wrapped in a single top-level folder that matches the
 * torrent name. Rendering it would add a useless extra level, so drop it when
 * every file shares the same root.
 */
function getSharedRoot(paths: string[][]): string | null {
  if (paths.length === 0) return null

  const [first] = paths
  if (first.length < 2) return null

  const root = first[0]
  return paths.every((parts) => parts.length > 1 && parts[0] === root)
    ? root
    : null
}

function compareNodes(a: TorrentFileTreeNode, b: TorrentFileTreeNode): number {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function buildFileNode(file: SelectableTorrentFile): TorrentFileTreeFile {
  const parts = splitPath(file.name)

  return {
    type: "file",
    name: parts[parts.length - 1] ?? file.name,
    path: normalizePath(file.name),
    file,
    fileIndexes: [file.index],
    totalLength: file.length,
    bytesCompleted: file.bytesCompleted,
  }
}

function buildDirectoryNode(
  directory: MutableDirectory,
): TorrentFileTreeDirectory {
  const children = buildChildren(directory)

  return {
    type: "directory",
    name: directory.name,
    path: directory.path,
    children,
    fileIndexes: children.flatMap((child) => child.fileIndexes),
    totalLength: children.reduce(
      (total, child) => total + child.totalLength,
      0,
    ),
    bytesCompleted: children.reduce(
      (total, child) => total + child.bytesCompleted,
      0,
    ),
  }
}

function buildChildren(directory: MutableDirectory): TorrentFileTreeNode[] {
  const directories = Array.from(directory.children.values())
    .map((child) => buildDirectoryNode(child))
    .sort(compareNodes)

  const fileNodes = directory.files.map(buildFileNode).sort(compareNodes)

  return [...directories, ...fileNodes]
}

export function buildTorrentFileTree(
  files: SelectableTorrentFile[],
): TorrentFileTreeNode[] {
  if (files.length === 0) return []

  const paths = files.map((file) => splitPath(file.name))
  const sharedRoot = getSharedRoot(paths)
  const root: MutableDirectory = {
    name: "",
    path: "",
    children: new Map(),
    files: [],
  }

  files.forEach((file, fileIndex) => {
    const parts = paths[fileIndex]
    const relativeParts = sharedRoot ? parts.slice(1) : parts
    const directoryParts = relativeParts.slice(0, -1)

    let directory = root

    directoryParts.forEach((part, depth) => {
      const pathEnd = depth + (sharedRoot ? 2 : 1)
      const path = parts.slice(0, pathEnd).join("/")
      let child = directory.children.get(part)

      if (!child) {
        child = {
          name: part,
          path,
          children: new Map(),
          files: [],
        }
        directory.children.set(part, child)
      }

      directory = child
    })

    directory.files.push(file)
  })

  return buildChildren(root)
}

export function flattenTorrentFileTree(
  nodes: TorrentFileTreeNode[],
  collapsedPaths: ReadonlySet<string> = new Set(),
): FlatTorrentFileNode[] {
  const flattened: FlatTorrentFileNode[] = []

  const visit = (entries: TorrentFileTreeNode[], depth: number) => {
    entries.forEach((node) => {
      flattened.push({ node, depth })

      if (node.type === "directory" && !collapsedPaths.has(node.path)) {
        visit(node.children, depth + 1)
      }
    })
  }

  visit(nodes, 0)
  return flattened
}

export function collectDirectoryPaths(nodes: TorrentFileTreeNode[]): string[] {
  const paths: string[] = []

  const visit = (entries: TorrentFileTreeNode[]) => {
    entries.forEach((node) => {
      if (node.type !== "directory") return
      paths.push(node.path)
      visit(node.children)
    })
  }

  visit(nodes)
  return paths
}

export function getSelectionState(
  node: TorrentFileTreeNode,
  selectedIndexes: ReadonlySet<number>,
): TorrentFileSelectionState {
  let selectedCount = 0

  node.fileIndexes.forEach((index) => {
    if (selectedIndexes.has(index)) selectedCount += 1
  })

  if (selectedCount === 0) return "unchecked"
  return selectedCount === node.fileIndexes.length ? "checked" : "mixed"
}

export function toggleNodeSelection(
  selectedIndexes: number[],
  node: TorrentFileTreeNode,
): number[] {
  const selected = new Set(selectedIndexes)
  const state = getSelectionState(node, selected)

  node.fileIndexes.forEach((index) => {
    if (state === "checked") {
      selected.delete(index)
    } else {
      selected.add(index)
    }
  })

  return Array.from(selected).sort((a, b) => a - b)
}
