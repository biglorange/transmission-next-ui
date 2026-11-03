import { expect, test } from "vitest"

import { getRequiredRpcFields } from "./columns"

test("list requests fields needed by the filter panel", () => {
  const fields = getRequiredRpcFields([], "list")

  expect(fields).toEqual(
    expect.arrayContaining([
      "labels",
      "error",
      "errorString",
      "isFinished",
      "percentDone",
      "isStalled",
    ]),
  )
})
