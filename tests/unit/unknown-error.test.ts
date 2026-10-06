import { describe, expect, it } from "vitest";

import { InvalidResultError, INVALID_RESULT_ERROR_CODE } from "@/errors/invalid-result";

describe("InvalidResultError", () => {
  it("should extend Error", () => {
    const error = InvalidResultError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidResultError);
  });

  it("should use the expected name", () => {
    const error = InvalidResultError();

    expect(error.name).toBe("InvalidResultError");
  });

  it("should use the expected code", () => {
    const error = InvalidResultError();

    expect(error.code).toBe(INVALID_RESULT_ERROR_CODE);
    expect(error.code).toBe("INVALID_RESULT_ERROR");
  });

  it("should use the default message", () => {
    const error = InvalidResultError();

    expect(error.message).toBe(
      "The provided value is not a valid Result error. It must extend Error and have an explicitly typed literal code.",
    );
  });

  it("should preserve the cause", () => {
    const cause = {
      reason: "failed",
    };

    const error = InvalidResultError({ cause });

    expect(error.cause).toBe(cause);
  });
});
