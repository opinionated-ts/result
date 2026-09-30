import { describe, expect, it } from "vitest";

import { UnknownError, UNKNOWN_ERROR_CODE } from "@/errors/unknown";

describe("UnknownError", () => {
  it("should extend Error", () => {
    const error = UnknownError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnknownError);
  });

  it("should use the expected name", () => {
    const error = UnknownError();

    expect(error.name).toBe("UnknownError");
  });

  it("should use the expected code", () => {
    const error = UnknownError();

    expect(error.code).toBe(UNKNOWN_ERROR_CODE);
    expect(error.code).toBe("UNKNOWN_ERROR");
  });

  it("should use the default message", () => {
    const error = UnknownError();

    expect(error.message).toBe("An unknown error occurred");
  });

  it("should preserve the cause", () => {
    const cause = {
      reason: "failed",
    };

    const error = UnknownError({ cause });

    expect(error.cause).toBe(cause);
  });
});
