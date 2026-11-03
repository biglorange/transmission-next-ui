import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"

import { I18nProvider } from "@/lib/i18n-context"
import { TorrentSelectionBar } from "./torrent-selection-bar"

const baseProps = {
  selectedCount: 3,
  filteredCount: 56,
  pageCount: 50,
  isAllSelected: false,
  isPageSelected: false,
  onToggleSelectAll: vi.fn(),
  onToggleSelectPage: vi.fn(),
  onClearSelection: vi.fn(),
}

test("shows counts and triggers all, page and clear actions", async () => {
  const user = userEvent.setup()

  render(
    <I18nProvider>
      <TorrentSelectionBar {...baseProps} />
    </I18nProvider>,
  )

  expect(screen.getByText("3")).toBeInTheDocument()
  expect(screen.getByText("56")).toBeInTheDocument()
  expect(screen.getByText("50")).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Select all" }))
  expect(baseProps.onToggleSelectAll).toHaveBeenCalledTimes(1)

  await user.click(screen.getByRole("button", { name: "Select this page" }))
  expect(baseProps.onToggleSelectPage).toHaveBeenCalledTimes(1)

  await user.click(screen.getByRole("button", { name: "Clear selection" }))
  expect(baseProps.onClearSelection).toHaveBeenCalledTimes(1)
})

test("uses deselect labels for active selections", () => {
  render(
    <I18nProvider>
      <TorrentSelectionBar {...baseProps} isAllSelected isPageSelected />
    </I18nProvider>,
  )

  expect(
    screen.getByRole("button", { name: "Deselect all" }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole("button", { name: "Deselect this page" }),
  ).toBeInTheDocument()
})

test("hides the page action when everything fits on one page", () => {
  render(
    <I18nProvider>
      <TorrentSelectionBar {...baseProps} filteredCount={20} pageCount={20} />
    </I18nProvider>,
  )

  expect(
    screen.queryByRole("button", { name: "Select this page" }),
  ).not.toBeInTheDocument()
})
