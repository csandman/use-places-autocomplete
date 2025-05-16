import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useLatest from "../useLatest";

describe("useLatest", () => {
  it("should return correctly", () => {
    const val = "test";
    const { result } = renderHook(() => useLatest(val));
    expect(result.current.current).toBe(val);
  });
});
