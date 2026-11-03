import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"

import { I18nProvider } from "@/lib/i18n-context"
import { TorrentFileSelector } from "./torrent-file-selector"

const files = [
  { index: 0, name: "bundle/video.mkv", length: 2048, bytesCompleted: 1024 },
  { index: 1, name: "bundle/sample.txt", length: 128, bytesCompleted: 0 },
]

const treeFiles = [
  {
    index: 0,
    name: "Bundle/Season 1/E01.mkv",
    length: 2048,
    bytesCompleted: 2048,
  },
  {
    index: 1,
    name: "Bundle/Season 1/E02.mkv",
    length: 1024,
    bytesCompleted: 0,
  },
  { index: 2, name: "Bundle/Subs/en.srt", length: 128, bytesCompleted: 0 },
]

test("toggles individual files and all files", async () => {
  const onSelectionChange = vi.fn()
  const user = userEvent.setup()
  const { rerender } = render(
    <I18nProvider>
      <TorrentFileSelector
        files={files}
        selectedFileIndexes={[0, 1]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )

  await user.click(screen.getByRole("checkbox", { name: /sample\.txt/ }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([0])

  rerender(
    <I18nProvider>
      <TorrentFileSelector
        files={files}
        selectedFileIndexes={[0]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )
  await user.click(screen.getByRole("checkbox", { name: /Select all/ }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([0, 1])
})

test("groups files by directory, collapses and toggles directories", async () => {
  const onSelectionChange = vi.fn()
  const user = userEvent.setup()
  const { rerender } = render(
    <I18nProvider>
      <TorrentFileSelector
        files={treeFiles}
        selectedFileIndexes={[0, 1, 2]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )

  expect(screen.getByRole("checkbox", { name: "Season 1" })).toHaveAttribute(
    "aria-checked",
    "true",
  )
  expect(screen.getByRole("checkbox", { name: /E01\.mkv/ })).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Season 1" }))
  expect(
    screen.queryByRole("checkbox", { name: /E01\.mkv/ }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByRole("checkbox", { name: "Season 1" }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([2])

  rerender(
    <I18nProvider>
      <TorrentFileSelector
        files={treeFiles}
        selectedFileIndexes={[2]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )
  expect(screen.getByRole("checkbox", { name: "Season 1" })).toHaveAttribute(
    "aria-checked",
    "false",
  )
  await user.click(screen.getByRole("checkbox", { name: "Season 1" }))
  expect(onSelectionChange).toHaveBeenLastCalledWith([0, 1, 2])

  rerender(
    <I18nProvider>
      <TorrentFileSelector
        files={treeFiles}
        selectedFileIndexes={[0]}
        onSelectionChange={onSelectionChange}
      />
    </I18nProvider>,
  )
  expect(screen.getByRole("checkbox", { name: "Season 1" })).toHaveAttribute(
    "aria-checked",
    "mixed",
  )
})

test("expands and collapses every directory", async () => {
  const user = userEvent.setup()

  render(
    <I18nProvider>
      <TorrentFileSelector
        files={treeFiles}
        selectedFileIndexes={[0, 1, 2]}
        onSelectionChange={vi.fn()}
      />
    </I18nProvider>,
  )

  await user.click(screen.getByRole("button", { name: "Collapse all" }))
  expect(
    screen.queryByRole("checkbox", { name: /E01\.mkv/ }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Expand all" }))
  expect(screen.getByRole("checkbox", { name: /E01\.mkv/ })).toBeInTheDocument()
})
