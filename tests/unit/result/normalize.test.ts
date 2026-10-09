import { describe, expect, it } from "vitest";

import { failure, normalizeResult, success } from "@/index";

class CustomError extends Error {}

describe("normalizeResult", () => {
  it("should wrap a plain value in Success", () => {
    expect(normalizeResult(42)).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should preserve a Failure", () => {
    const errorValue = new CustomError("failed");
    const result = failure(errorValue);

    expect(normalizeResult(result)).toBe(result);
  });

  it("should preserve a plain Success", () => {
    const result = success(42);

    expect(normalizeResult(result)).toBe(result);
  });

  it("should unwrap a nested Success", () => {
    const result = normalizeResult(success(success(42)));

    expect(result).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should recursively unwrap deeply nested Success values", () => {
    const result = normalizeResult(success(success(success(success(42)))));

    expect(result).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should unwrap a Failure nested inside Success", () => {
    const errorValue = new CustomError("failed");

    const result = normalizeResult(success(success(failure(errorValue))));

    expect(result).toEqual({
      ok: false,
      error: errorValue,
    });
  });

  it("should recursively unwrap a Failure from any nesting depth", () => {
    const errorValue = new CustomError("failed");

    const result = normalizeResult(success(success(success(failure(errorValue)))));

    expect(result).toEqual({
      ok: false,
      error: errorValue,
    });
  });

  it("should preserve falsy values", () => {
    expect(normalizeResult(false)).toEqual({
      ok: true,
      value: false,
    });

    expect(normalizeResult(0)).toEqual({
      ok: true,
      value: 0,
    });

    expect(normalizeResult("")).toEqual({
      ok: true,
      value: "",
    });

    expect(normalizeResult(null)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("should preserve object identity for plain values", () => {
    const value = { id: 1 };

    const result = normalizeResult(value);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toBe(value);
    }
  });
});
