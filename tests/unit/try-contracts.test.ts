import { describe, expect, expectTypeOf, it } from "vitest";

import type { Failure } from "@/types";

import { tryResult, tryResultAsync } from "@/index";

class UserLoadFailedError extends Error {
  readonly code = "USER_LOAD_FAILED";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UserLoadFailedError";
  }
}

describe("tryResult typed error contract", () => {
  it("should map a thrown value to the exact typed error", () => {
    const cause = new Error("database failed");

    const result = tryResult(
      () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("Could not load user.", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UserLoadFailedError);
      expect(result.error.code).toBe("USER_LOAD_FAILED");
      expect(result.error.cause).toBe(cause);
    }

    expectTypeOf(result).toEqualTypeOf<Failure<UserLoadFailedError>>();
  });

  it("should pass the original thrown value to the mapper", () => {
    const cause = new Error("failed");

    tryResult(
      () => {
        throw cause;
      },
      (caught) => {
        expect(caught).toBe(cause);
        return new UserLoadFailedError("mapped", { cause: caught });
      },
    );
  });

  it("should type the mapper cause as unknown", () => {
    tryResult(
      () => {
        throw new Error("failed");
      },
      (cause) => {
        expectTypeOf(cause).toEqualTypeOf<unknown>();

        // @ts-expect-error The cause is unknown and must be narrowed before use.
        void cause.message;

        return new UserLoadFailedError("failed", { cause });
      },
    );
  });

  it("should reject a mapper that returns an error without a literal code", () => {
    tryResult(
      () => {
        throw new Error("failed");
      },
      // @ts-expect-error A mapped error must expose an explicitly typed literal code.
      () => new Error("failed"),
    );
  });

  it("should inherit the original error stack by default", () => {
    const cause = new Error("failed");

    const result = tryResult(
      () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("mapped", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.stack).toBe(cause.stack);
    }
  });

  it("should preserve the mapped error stack when inheritStack is false", () => {
    const cause = new Error("failed");

    const result = tryResult(
      () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("mapped", { cause: caught }),
      { inheritStack: false },
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.stack).not.toBe(cause.stack);
    }
  });

  it("should fall back to InvalidResultError if the runtime mapper contract is violated", () => {
    const mappedError = new UserLoadFailedError("invalid");

    Object.defineProperty(mappedError, "code", { value: undefined });

    const result = tryResult(
      () => {
        throw new Error("failed");
      },
      () => mappedError,
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.name).toBe("InvalidResultError");
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });
});

describe("tryResultAsync typed error contract", () => {
  it("should map a thrown value to the exact typed error", async () => {
    const cause = new Error("database failed");

    const result = await tryResultAsync(
      async () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("Could not load user.", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UserLoadFailedError);
      expect(result.error.code).toBe("USER_LOAD_FAILED");
      expect(result.error.cause).toBe(cause);
    }

    expectTypeOf(result).toEqualTypeOf<Failure<UserLoadFailedError>>();
  });

  it("should pass the original rejected value to the mapper", async () => {
    const cause = new Error("failed");

    await tryResultAsync(
      async () => {
        throw cause;
      },
      (caught) => {
        expect(caught).toBe(cause);
        return new UserLoadFailedError("mapped", { cause: caught });
      },
    );
  });

  it("should type the async mapper cause as unknown", async () => {
    await tryResultAsync(
      async () => {
        throw new Error("failed");
      },
      (cause) => {
        expectTypeOf(cause).toEqualTypeOf<unknown>();

        // @ts-expect-error The cause is unknown and must be narrowed before use.
        void cause.message;

        return new UserLoadFailedError("failed", { cause });
      },
    );
  });

  it("should reject an async mapper that returns an error without a literal code", async () => {
    await tryResultAsync(
      async () => {
        throw new Error("failed");
      },
      // @ts-expect-error A mapped error must expose an explicitly typed literal code.
      () => new Error("failed"),
    );
  });

  it("should inherit the original rejection stack by default", async () => {
    const cause = new Error("failed");

    const result = await tryResultAsync(
      async () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("mapped", { cause: caught }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.stack).toBe(cause.stack);
    }
  });

  it("should preserve the mapped error stack when inheritStack is false", async () => {
    const cause = new Error("failed");

    const result = await tryResultAsync(
      async () => {
        throw cause;
      },
      (caught) => new UserLoadFailedError("mapped", { cause: caught }),
      { inheritStack: false },
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.stack).not.toBe(cause.stack);
    }
  });

  it("should fall back to InvalidResultError if the runtime mapper contract is violated", async () => {
    const mappedError = new UserLoadFailedError("invalid");

    Object.defineProperty(mappedError, "code", { value: undefined });

    const result = await tryResultAsync(
      async () => {
        throw new Error("failed");
      },
      () => mappedError,
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.name).toBe("InvalidResultError");
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });
});
