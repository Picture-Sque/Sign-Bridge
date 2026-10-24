import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Placeholder test for the empty scaffold (P0-03). It also checks that the
// Node in use matches the version pinned in .nvmrc.
describe("toolchain", () => {
  it("runs on the Node major version pinned in .nvmrc", () => {
    const pinned = readFileSync(
      new URL("../.nvmrc", import.meta.url),
      "utf8",
    ).trim();
    const major = process.versions.node.split(".")[0];
    expect(major).toBe(pinned);
  });
});
