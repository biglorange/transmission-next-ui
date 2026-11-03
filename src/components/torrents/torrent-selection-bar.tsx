import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

interface TorrentSelectionBarProps {
  selectedCount: number
  filteredCount: number
  pageCount: number
  isAllSelected: boolean
  isPageSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelectPage: () => void
  onClearSelection: () => void
}

export function TorrentSelectionBar({
  selectedCount,
  filteredCount,
  pageCount,
  isAllSelected,
  isPageSelected,
  onToggleSelectAll,
  onToggleSelectPage,
  onClearSelection,
}: TorrentSelectionBarProps) {
  const { t } = useI18n()

  if (filteredCount === 0) return null

  const hasMoreThanOnePage = filteredCount > pageCount
  const selectAllLabel = isAllSelected
    ? t("common.deselect_all", "Deselect all")
    : t("common.select_all_all_pages", "Select all")
  const selectPageLabel = isPageSelected
    ? t("common.deselect_current_page", "Deselect this page")
    : t("common.select_current_page", "Select this page")

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-muted/30 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span>
          {t("common.selected")}{" "}
          <span className="font-bold tabular-nums text-foreground">
            {selectedCount}
          </span>
        </span>
        <span className="text-muted-foreground/30">/</span>
        <span>
          {t("common.total")}{" "}
          <span className="font-bold tabular-nums text-foreground">
            {filteredCount}
          </span>
        </span>
        <span className="hidden text-muted-foreground/30 sm:inline">·</span>
        <span className="hidden sm:inline">
          {t("common.current_page", "This page")}{" "}
          <span className="font-bold tabular-nums text-foreground">
            {pageCount}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={isAllSelected ? "secondary" : "ghost"}
          size="sm"
          className="h-7 rounded-lg px-2.5 text-[11px] font-semibold"
          onClick={onToggleSelectAll}
          disabled={filteredCount === 0}
        >
          {selectAllLabel}
        </Button>
        {hasMoreThanOnePage && (
          <Button
            variant={isPageSelected ? "secondary" : "ghost"}
            size="sm"
            className="h-7 rounded-lg px-2.5 text-[11px] font-semibold"
            onClick={onToggleSelectPage}
          >
            {selectPageLabel}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          title={t("common.clear_selection", "Clear selection")}
          aria-label={t("common.clear_selection", "Clear selection")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
