import { expect, it } from "vitest";

// Throwaway P0-03 CI check: deliberate failing test.
it("fails on purpose", () => {
  expect(1).toBe(2);
});
