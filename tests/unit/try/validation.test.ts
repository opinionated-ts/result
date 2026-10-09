import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  failure,
  InvalidResultError,
  success,
  tryResult,
  tryResultAsync,
  type Failure,
  type Success,
} from "@/index";

class DatabaseError extends Error {
  readonly code = "DATABASE_ERROR" as const;
}

class MappedError extends Error {
  readonly code = "MAPPED_ERROR" as const;
}

const invalidError = () => new Error("missing result code");

describe("tryResult validation and precedence", () => {
  it("preserves a returned Failure only when its inner error is valid", () => {
    const cause = new DatabaseError("database failed");
    const mapper = vi.fn(() => new MappedError("mapped"));

    const result = tryResult(() => failure(cause), mapper);

    expect(result).toEqual(failure(cause));
    expect(mapper).not.toHaveBeenCalled();
    expectTypeOf(result).toEqualTypeOf<Failure<DatabaseError>>();
  });

  it("maps a returned Failure whose inner error is invalid", () => {
    const cause = invalidError();
    const mapper = vi.fn(() => new MappedError("mapped"));

    const result = tryResult(() => failure(cause), mapper);

    expect(result).toEqual(failure(expect.objectContaining({ code: "MAPPED_ERROR" })));
    expect(mapper).toHaveBeenCalledWith(cause);
    expectTypeOf(result).toEqualTypeOf<Failure<MappedError>>();
  });

  it("falls back when a returned Failure has an invalid error and no mapper", () => {
    const cause = invalidError();
    const result = tryResult(() => failure(cause));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidResultError);
      expect(result.error.cause).toBe(cause);
    }
  });

  it("converts a directly returned valid ResultError into Failure", () => {
    const cause = new DatabaseError("database failed");
    const result = tryResult(() => cause);

    expect(result).toEqual(failure(cause));
    expectTypeOf(result).toEqualTypeOf<Failure<DatabaseError>>();
  });

  it("maps a directly returned Error that is not a valid ResultError", () => {
    const cause = invalidError();
    const mapper = vi.fn(() => new MappedError("mapped"));
    const result = tryResult(() => cause, mapper);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(MappedError);
    expect(mapper).toHaveBeenCalledWith(cause);
  });

  it("keeps ordinary returned values as Success without invoking the mapper", () => {
    const mapper = vi.fn(() => new MappedError("must not run"));
    const result = tryResult(() => 42, mapper);

    expect(result).toEqual(success(42));
    expect(mapper).not.toHaveBeenCalled();
    expectTypeOf(result).toEqualTypeOf<Success<number> | Failure<MappedError>>();
  });

  it("maps a thrown Failure whose inner error is invalid", () => {
    const cause = invalidError();
    const mapper = vi.fn(() => new MappedError("mapped"));
    const result = tryResult(() => {
      throw failure(cause);
    }, mapper);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(MappedError);
    expect(mapper).toHaveBeenCalledWith(cause);
  });

  it("does not call the mapper for a thrown Failure with a valid error", () => {
    const cause = new DatabaseError("database failed");
    const mapper = vi.fn(() => new MappedError("must not run"));
    const result = tryResult(() => {
      throw failure(cause);
    }, mapper);

    expect(result).toEqual(failure(cause));
    expect(mapper).not.toHaveBeenCalled();
  });

  it("tries the mapper for a thrown Success and falls back if it is absent", () => {
    const cause = success(42);
    const mapper = vi.fn(() => new MappedError("mapped"));
    const result = tryResult(() => {
      throw cause;
    }, mapper);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(MappedError);
    expect(mapper).toHaveBeenCalledWith(cause);

    const fallback = tryResult(() => {
      throw cause;
    });
    expect(fallback.ok).toBe(false);
    if (!fallback.ok) expect(fallback.error).toBeInstanceOf(InvalidResultError);
  });

  it("uses InvalidResultError when the mapper itself throws", () => {
    const cause = invalidError();
    const maperError = new Error("mapper failed");
    const result = tryResult(
      () => {
        throw cause;
      },
      () => {
        throw maperError;
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidResultError);
      expect(result.error.cause).toBe(maperError);
    }
  });
});

describe("tryResultAsync validation and precedence", () => {
  it("validates a returned Failure and maps an invalid inner error", async () => {
    const cause = invalidError();
    const mapper = vi.fn(() => new MappedError("mapped"));
    const result = await tryResultAsync(async () => failure(cause), mapper);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(MappedError);
    expect(mapper).toHaveBeenCalledWith(cause);
    expectTypeOf(result).toEqualTypeOf<Failure<MappedError>>();
  });

  it("converts a directly returned valid ResultError into Failure", async () => {
    const cause = new DatabaseError("database failed");
    const result = await tryResultAsync(async () => cause);

    expect(result).toEqual(failure(cause));
    expectTypeOf(result).toEqualTypeOf<Failure<DatabaseError>>();
  });

  it("uses the mapper for an invalid rejection and preserves the exact mapped type", async () => {
    const cause = invalidError();
    const result = await tryResultAsync(
      async () => {
        throw cause;
      },
      () => new MappedError("mapped"),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(MappedError);
    expectTypeOf(result).toEqualTypeOf<Failure<MappedError>>();
  });

  it("uses InvalidResultError for invalid returned Failure without a mapper", async () => {
    const cause = invalidError();
    const result = await tryResultAsync(async () => failure(cause));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidResultError);
      expect(result.error.cause).toBe(cause);
    }
  });
});
