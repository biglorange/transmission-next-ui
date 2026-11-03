import { useEffect, useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  FileIcon,
  Folder,
  FolderOpen,
  Minus,
} from "lucide-react"

import { formatSize } from "@/lib/formatters"
import { useI18n } from "@/lib/i18n-context"
import type { SelectableTorrentFile } from "@/lib/torrent-file-selection"
import {
  buildTorrentFileTree,
  collectDirectoryPaths,
  flattenTorrentFileTree,
  getSelectionState,
  toggleNodeSelection,
  type TorrentFileTreeDirectory,
  type TorrentFileTreeFile,
  type TorrentFileSelectionState,
} from "@/lib/torrent-file-tree"
import { cn } from "@/lib/utils"

interface TorrentFileSelectorProps {
  files: SelectableTorrentFile[]
  selectedFileIndexes: number[]
  onSelectionChange: (indexes: number[]) => void
  showProgress?: boolean
  maxHeightClassName?: string
}

function SelectionCheckbox({ checked }: { checked: boolean | "mixed" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/40",
      )}
    >
      {checked === true ? (
        <Check className="h-3 w-3" />
      ) : checked === "mixed" ? (
        <Minus className="h-3 w-3" />
      ) : null}
    </span>
  )
}

function SelectionProgress({
  bytesCompleted,
  totalLength,
}: {
  bytesCompleted: number
  totalLength: number
}) {
  const progress =
    totalLength > 0 ? Math.min(100, (bytesCompleted / totalLength) * 100) : 0

  return (
    <span className="flex w-32 shrink-0 items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </span>
      <span className="w-10 text-right text-[10px] tabular-nums">
        {progress.toFixed(1)}%
      </span>
    </span>
  )
}

function FileRow({
  node,
  depth,
  checked,
  showProgress,
  onToggle,
}: {
  node: TorrentFileTreeFile
  depth: number
  checked: boolean
  showProgress: boolean
  onToggle: (index: number) => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="flex min-h-11 w-full items-center gap-3 border-b border-muted/20 py-2 pr-4 text-left last:border-0 hover:bg-muted/30"
      style={{ paddingLeft: `${16 + depth * 16}px` }}
      onClick={() => onToggle(node.file.index)}
      title={node.path}
    >
      <span className="h-4 w-4 shrink-0" aria-hidden="true" />
      <SelectionCheckbox checked={checked} />
      <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
      <span className="min-w-0 flex-1 break-all text-xs">{node.name}</span>
      <span className="w-20 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
        {formatSize(node.totalLength)}
      </span>
      {showProgress && (
        <SelectionProgress
          bytesCompleted={node.bytesCompleted}
          totalLength={node.totalLength}
        />
      )}
    </button>
  )
}

function DirectoryRow({
  node,
  depth,
  state,
  expanded,
  showProgress,
  onToggleExpanded,
  onToggleSelection,
}: {
  node: TorrentFileTreeDirectory
  depth: number
  state: TorrentFileSelectionState
  expanded: boolean
  showProgress: boolean
  onToggleExpanded: (path: string) => void
  onToggleSelection: (node: TorrentFileTreeDirectory) => void
}) {
  const { t } = useI18n()
  const checked =
    state === "checked" ? true : state === "mixed" ? "mixed" : false

  return (
    <div
      className="flex min-h-11 items-center gap-2 border-b border-muted/20 pr-4 hover:bg-muted/20"
      style={{ paddingLeft: `${16 + depth * 16}px` }}
    >
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        aria-expanded={expanded}
        aria-label={`${expanded ? t("common.collapse", "Collapse") : t("common.expand", "Expand")} ${node.name}`}
        onClick={() => onToggleExpanded(node.path)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={node.name}
        className="flex shrink-0 items-center"
        onClick={() => onToggleSelection(node)}
      >
        <SelectionCheckbox checked={checked} />
      </button>

      {expanded ? (
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      ) : (
        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      )}

      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-xs font-medium"
        title={node.path}
        onClick={() => onToggleExpanded(node.path)}
      >
        {node.name}
      </button>

      <span className="w-20 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
        {formatSize(node.totalLength)}
      </span>
      {showProgress && (
        <SelectionProgress
          bytesCompleted={node.bytesCompleted}
          totalLength={node.totalLength}
        />
      )}
    </div>
  )
}

export function TorrentFileSelector({
  files,
  selectedFileIndexes,
  onSelectionChange,
  showProgress = false,
  maxHeightClassName = "max-h-52",
}: TorrentFileSelectorProps) {
  const { t } = useI18n()
  // Directories start collapsed; only paths the user explicitly expands are
  // kept here. This keeps large torrents readable on first open.
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(),
  )

  const tree = useMemo(() => buildTorrentFileTree(files), [files])
  const directoryPaths = useMemo(() => collectDirectoryPaths(tree), [tree])
  const collapsedPaths = useMemo(
    () =>
      new Set(
        directoryPaths.filter((path) => !expandedPaths.has(path)),
      ),
    [directoryPaths, expandedPaths],
  )
  const flattened = useMemo(
    () => flattenTorrentFileTree(tree, collapsedPaths),
    [tree, collapsedPaths],
  )
  const selected = useMemo(
    () => new Set(selectedFileIndexes),
    [selectedFileIndexes],
  )

  // A different torrent (e.g. navigating to another detail page) starts
  // collapsed again. Polling the same torrent keeps the same signature and
  // therefore keeps the user's expanded folders.
  const fileSignature = useMemo(
    () => files.map((file) => `${file.index}:${file.name}`).join("\n"),
    [files],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedPaths(new Set())
  }, [fileSignature])

  const selectedCount = files.reduce(
    (count, file) => count + (selected.has(file.index) ? 1 : 0),
    0,
  )
  const allSelected = files.length > 0 && selectedCount === files.length
  const someSelected = selectedCount > 0
  const selectedBytes = files.reduce(
    (total, file) => total + (selected.has(file.index) ? file.length : 0),
    0,
  )

  const toggleFile = (index: number) => {
    onSelectionChange(
      selected.has(index)
        ? selectedFileIndexes.filter((fileIndex) => fileIndex !== index)
        : [...selectedFileIndexes, index].sort((a, b) => a - b),
    )
  }

  const toggleDirectory = (node: TorrentFileTreeDirectory) => {
    onSelectionChange(toggleNodeSelection(selectedFileIndexes, node))
  }

  const toggleExpanded = (path: string) => {
    setExpandedPaths((previous) => {
      const next = new Set(previous)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const expandAll = () => setExpandedPaths(new Set(directoryPaths))
  const collapseAll = () => setExpandedPaths(new Set())

  return (
    <div className="overflow-hidden border-y border-muted/30">
      <div className="flex min-h-11 items-center gap-3 bg-muted/20 px-4 text-xs font-medium">
        <button
          type="button"
          role="checkbox"
          aria-checked={allSelected ? true : someSelected ? "mixed" : false}
          aria-label={t("common.select_all", "Select all")}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() =>
            onSelectionChange(
              allSelected ? [] : files.map((file) => file.index),
            )
          }
        >
          <SelectionCheckbox
            checked={allSelected ? true : someSelected ? "mixed" : false}
          />
          <span className="truncate">
            {t("common.select_all", "Select all")}
          </span>
        </button>

        <span className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
          {selectedCount}/{files.length} · {formatSize(selectedBytes)}
        </span>

        {directoryPaths.length > 0 && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              title={t("common.expand_all", "Expand all")}
              aria-label={t("common.expand_all", "Expand all")}
              onClick={expandAll}
            >
              <ChevronsDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              title={t("common.collapse_all", "Collapse all")}
              aria-label={t("common.collapse_all", "Collapse all")}
              onClick={collapseAll}
            >
              <ChevronsUp className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "overflow-y-auto border-t border-muted/20",
          maxHeightClassName,
        )}
      >
        {flattened.map(({ node, depth }) =>
          node.type === "directory" ? (
            <DirectoryRow
              key={`directory:${node.path}`}
              node={node}
              depth={depth}
              state={getSelectionState(node, selected)}
              expanded={expandedPaths.has(node.path)}
              showProgress={showProgress}
              onToggleExpanded={toggleExpanded}
              onToggleSelection={toggleDirectory}
            />
          ) : (
            <FileRow
              key={`file:${node.file.index}`}
              node={node}
              depth={depth}
              checked={selected.has(node.file.index)}
              showProgress={showProgress}
              onToggle={toggleFile}
            />
          ),
        )}
      </div>
    </div>
  )
}
