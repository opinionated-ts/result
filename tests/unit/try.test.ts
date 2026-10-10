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

  it("should preserve a non-Error thrown value", () => {
    const result = tryResult(() => {
      throw "failed";
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBe("failed");
    }
  });

  it("should map a thrown value to a custom failure value", () => {
    const result = tryResult(
      () => {
        throw "failed";
      },
      (cause) => ({ cause, kind: "load-failed" as const }),
    );

    expect(result).toEqual({
      ok: false,
      error: { cause: "failed", kind: "load-failed" },
    });
  });

  it("should inherit the caught Error stack for a mapped Error by default", () => {
    let cause: Error | undefined;
    const result = tryResult(
      () => {
        cause = new Error("cause");
        throw cause;
      },
      (caught) => new Error("mapped", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok && result.error instanceof Error) {
      expect(result.error.stack).toBe(cause?.stack);
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

  it("should preserve a rejected non-Error value", async () => {
    const result = await tryResultAsync(async () => {
      throw "failed";
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBe("failed");
    }
  });

  it("should map a rejected value to a custom failure value", async () => {
    const result = await tryResultAsync(
      async () => {
        throw "failed";
      },
      (cause) => `request failed: ${String(cause)}`,
    );

    expect(result).toEqual({
      ok: false,
      error: "request failed: failed",
    });
  });

  it("should inherit the rejected Error stack for a mapped Error by default", async () => {
    const cause = new Error("cause");
    const result = await tryResultAsync(
      async () => {
        throw cause;
      },
      (caught) => new Error("mapped", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok && result.error instanceof Error) {
      expect(result.error.stack).toBe(cause.stack);
    }
  });
});
