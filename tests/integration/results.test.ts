import { describe, expect, it } from "vitest";

import { UnknownError, UNKNOWN_ERROR_CODE } from "@/errors/unknown";
import {
  error,
  failure,
  isFailure,
  isSuccess,
  ok,
  success,
  tryResult,
  tryResultAsync,
} from "@/index";

class MissingThingError extends Error {
  readonly code = "MISSING_THING";
}

class PermissionDeniedError extends Error {
  readonly code = "PERMISSION_DENIED";
}

function findThing(id: number) {
  if (id < 0) {
    return error(new MissingThingError("not found"));
  }

  if (id === 0) {
    return error(new PermissionDeniedError("permission denied"));
  }

  return ok({ id });
}

describe("results integration", () => {
  it("should infer branch-specific values and exhaustively narrow errors", () => {
    const successResult = findThing(1);

    if (successResult.ok) {
      expect(successResult.value.id).toBe(1);
    }

    const failureResult = findThing(-1);

    if (!failureResult.ok) {
      switch (failureResult.error.code) {
        case "MISSING_THING":
          expect(failureResult.error).toBeInstanceOf(MissingThingError);
          break;
        case "PERMISSION_DENIED":
          expect(failureResult.error).toBeInstanceOf(PermissionDeniedError);
          break;
        default:
          failureResult.error satisfies never;
      }
    }
  });

  it("should compose ok and guards", () => {
    const result = ok(ok(42));

    expect(isSuccess(result)).toBe(true);
    expect(isFailure(result)).toBe(false);

    if (isSuccess(result)) {
      expect(result.value).toBe(42);
    }
  });

  it("should compose ok, error and guards", () => {
    const errorValue = new Error("failed");
    const result = ok(error(errorValue));

    expect(isFailure(result)).toBe(true);
    expect(isSuccess(result)).toBe(false);

    if (isFailure(result)) {
      expect(result.error).toBe(errorValue);
    }
  });

  it("should convert an unknown thrown value through the complete try flow", () => {
    const result = tryResult(() => {
      throw {
        reason: "invalid input",
      };
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBeInstanceOf(UnknownError);
      expect(result.error.code).toBe(UNKNOWN_ERROR_CODE);
      expect(result.error.cause).toEqual({
        reason: "invalid input",
      });
    }
  });

  it("should preserve an existing Error through the complete try flow", () => {
    const errorValue = new Error("database failed");

    const result = tryResult(() => {
      throw errorValue;
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBe(errorValue);
    }
  });

  it("should normalize an existing Result returned by tryResult", () => {
    const result = tryResult(() => success(success("value")));

    expect(result).toEqual({
      ok: true,
      value: "value",
    });
  });

  it("should normalize an existing Failure returned by tryResult", () => {
    const errorValue = new Error("failed");

    const result = tryResult(() => success(failure(errorValue)));

    expect(result).toEqual({
      ok: false,
      error: errorValue,
    });
  });

  it("should compose async execution, normalization and guards", async () => {
    const result = await tryResultAsync(async () => success(success("value")));

    expect(isSuccess(result)).toBe(true);

    if (isSuccess(result)) {
      expect(result.value).toBe("value");
    }
  });

  it("should convert async unknown failures through the complete flow", async () => {
    const result = await tryResultAsync(async () => {
      throw 123;
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBeInstanceOf(UnknownError);
      expect(result.error.cause).toBe(123);
    }
  });

  it("should preserve native Error instances passed to error", () => {
    const errorValue = new TypeError("invalid value");

    const result = error(errorValue);

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBe(errorValue);
    }
  });
});
