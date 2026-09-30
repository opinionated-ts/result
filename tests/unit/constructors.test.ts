import { describe, expect, it } from "vitest";

import { error, failure, ok, success } from "@/index";

class CustomError extends Error {}

describe("results constructors", () => {
  describe("success", () => {
    it("should create a successful result", () => {
      expect(success(42)).toEqual({
        ok: true,
        value: 42,
      });
    });

    it("should preserve the original value", () => {
      const value = { id: 1 };

      expect(success(value).value).toBe(value);
    });

    it("should support undefined as a successful value", () => {
      expect(success(undefined)).toEqual({
        ok: true,
        value: undefined,
      });
    });
  });

  describe("failure", () => {
    it("should create a failed result", () => {
      const errorValue = new CustomError("failed");

      expect(failure(errorValue)).toEqual({
        ok: false,
        error: errorValue,
      });
    });

    it("should preserve the original error", () => {
      const errorValue = new CustomError("failed");

      expect(failure(errorValue).error).toBe(errorValue);
    });
  });

  describe("error", () => {
    it("should preserve an Error instance", () => {
      const errorValue = new CustomError("failed");

      const result = error(errorValue);

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(errorValue);
      }
    });

    it("should wrap non-Error causes in UnknownError", () => {
      const result = error("failed");

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.name).toBe("UnknownError");
      }
    });

    it("should preserve the original cause", () => {
      const cause = { reason: "failed" };

      const result = error(cause);

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.cause).toBe(cause);
      }
    });

    it("should preserve an existing Failure", () => {
      const errorValue = new CustomError("failed");
      const result = error(error(errorValue));

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(errorValue);
      }
    });
  });

  describe("ok", () => {
    it("should create a successful result", () => {
      expect(ok(42)).toEqual({
        ok: true,
        value: 42,
      });
    });

    it("should normalize nested successes", () => {
      expect(ok(ok(42))).toEqual({
        ok: true,
        value: 42,
      });
    });

    it("should preserve failures", () => {
      const errorValue = new CustomError("failed");

      const result = ok(error(errorValue));

      expect(result).toEqual({
        ok: false,
        error: errorValue,
      });
    });
  });
});
