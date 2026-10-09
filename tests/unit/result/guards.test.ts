import { describe, expect, it } from "vitest";

import { failure, isFailure, isSuccess, success } from "@/index";

describe("result guards", () => {
  describe("isSuccess", () => {
    it("should identify a Success", () => {
      expect(isSuccess(success(42))).toBe(true);
    });

    it("should reject a Failure", () => {
      expect(isSuccess(failure(new Error("failed")))).toBe(false);
    });

    it("should reject null", () => {
      expect(isSuccess(null)).toBe(false);
    });

    it("should reject primitive values", () => {
      expect(isSuccess(42)).toBe(false);
      expect(isSuccess("value")).toBe(false);
      expect(isSuccess(false)).toBe(false);
    });

    it("should reject objects without a value property", () => {
      expect(isSuccess({ ok: true })).toBe(false);
    });

    it("should identify an object with a valid Success shape", () => {
      expect(isSuccess({ ok: true, value: undefined })).toBe(true);
    });
  });

  describe("isFailure", () => {
    it("should identify a Failure", () => {
      expect(isFailure(failure(new Error("failed")))).toBe(true);
    });

    it("should reject a Success", () => {
      expect(isFailure(success(42))).toBe(false);
    });

    it("should reject null", () => {
      expect(isFailure(null)).toBe(false);
    });

    it("should reject primitive values", () => {
      expect(isFailure(42)).toBe(false);
      expect(isFailure("value")).toBe(false);
      expect(isFailure(false)).toBe(false);
    });

    it("should reject objects without an error property", () => {
      expect(isFailure({ ok: false })).toBe(false);
    });

    it("should identify an object with a valid Failure shape", () => {
      expect(isFailure({ ok: false, error: new Error("failed") })).toBe(true);
    });
  });
});
