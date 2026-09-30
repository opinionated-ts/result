import { describe, expect, it } from "vitest";

import { tryResult, tryResultAsync } from "@/index";

class CustomError extends Error {}

describe("tryResult", () => {
  it("should return Success when the factory succeeds", () => {
    expect(tryResult(() => 42)).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should normalize a Success returned by the factory", () => {
    expect(tryResult(() => ({ ok: true, value: 42 }))).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should normalize a nested Success returned by the factory", () => {
    expect(
      tryResult(() => ({
        ok: true,
        value: {
          ok: true,
          value: 42,
        },
      })),
    ).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should preserve an existing Failure returned by the factory", () => {
    const errorValue = new CustomError("failed");

    const result = tryResult(() => ({
      ok: false as const,
      error: errorValue,
    }));

    expect(result).toEqual({
      ok: false,
      error: errorValue,
    });
  });

  it("should convert a thrown Error into a Failure", () => {
    const errorValue = new CustomError("failed");

    const result = tryResult(() => {
      throw errorValue;
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBe(errorValue);
    }
  });

  it("should convert a non-Error throw into UnknownError", () => {
    const result = tryResult(() => {
      throw "failed";
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.name).toBe("UnknownError");
      expect(result.error.cause).toBe("failed");
    }
  });
});

describe("tryResultAsync", () => {
  it("should return Success when the factory resolves", async () => {
    await expect(tryResultAsync(async () => 42)).resolves.toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should normalize a resolved nested Success", async () => {
    await expect(
      tryResultAsync(async () => ({
        ok: true as const,
        value: {
          ok: true as const,
          value: 42,
        },
      })),
    ).resolves.toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should convert a rejected Error into a Failure", async () => {
    const errorValue = new CustomError("failed");

    const result = await tryResultAsync(async () => {
      throw errorValue;
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBe(errorValue);
    }
  });

  it("should convert a rejected non-Error value into UnknownError", async () => {
    const result = await tryResultAsync(async () => {
      throw "failed";
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.name).toBe("UnknownError");
      expect(result.error.cause).toBe("failed");
    }
  });
});
