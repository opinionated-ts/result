import { describe, expect, it } from "vitest";

import { INVALID_RESULT_ERROR_CODE, InvalidResultError } from "@/index";

describe("InvalidResultError", () => {
  it("should extend Error", () => {
    const error = new InvalidResultError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidResultError);
  });

  it("should use the expected name", () => {
    const error = new InvalidResultError();

    expect(error.name).toBe("InvalidResultError");
  });

  it("should use the expected code", () => {
    const error = new InvalidResultError();

    expect(error.code).toBe(INVALID_RESULT_ERROR_CODE);
    expect(error.code).toBe("INVALID_RESULT_ERROR");
  });

  it("should use the default message", () => {
    const error = new InvalidResultError();

    expect(error.message).toBe(
      "The provided value is not a valid Result error. It must extend Error and have an explicitly typed literal code.",
    );
  });

  it("should preserve the cause", () => {
    const cause = {
      reason: "failed",
    };

    const error = new InvalidResultError({ cause });

    expect(error.cause).toBe(cause);
  });
});
