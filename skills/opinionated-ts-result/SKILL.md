---
name: opinionated-ts-result
description: "Use when implementing, reviewing, or explaining TypeScript code with @opinionated-ts/result: typed Result values, constructor semantics, tryResult/tryResultAsync, exact error-code inference, runtime validation, propagation, and exhaustive handling."
---

# @opinionated-ts/result

Use this skill as the entry point for package-specific guidance. Prefer explicit result values over thrown expected errors, preserve exact failure types, and keep runtime behavior distinct from TypeScript's static guarantees.

## Core rules

- Use `ok(value)` to create a normalized result and `error(typedError)` to create a failure.
- Use `isSuccess()` / `isFailure()` to narrow results.
- Let TypeScript infer concrete success and failure types; avoid widening them to `Result<T, Error>`.
- Every typed error should extend `Error` and expose a literal string `code`, preferably `readonly code = "SOME_CODE"`.
- Do not use `throw` for expected application failures. TypeScript does not include thrown values in a function's return type.
- At runtime, validation can only check that `code` is a string, not whether its TypeScript type was a literal. Do not rely on runtime acceptance as proof of a precise static contract.
- Use `tryResult()` / `tryResultAsync()` to contain exceptions or rejections from dependencies and map them to typed operation errors.
- Propagate failures unchanged unless a layer intentionally changes the public meaning of the failure.

## Source-of-truth guides

- [Getting Started](./references/getting-started.md) — minimal path to creating and consuming results.
- [Result constructors and runtime behavior](./references/results.md) — `ok`, `error`, `success`, `failure`, normalization, runtime checks, and edge cases.
- [Try Results](./references/try-results.md) — mapper contracts, fallbacks, nested values, stack inheritance, and synchronous/asynchronous behavior.
- [Error Flow](./references/error-flow.md) — propagation, translation, and exhaustive handling.

Keep this skill as a concise router. Consult the relevant guide for details rather than duplicating its full examples here.

## Quick example

```ts
import { error, ok } from "@opinionated-ts/result";

class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND";
}

function getUser(id: string) {
  const user = users.get(id);
  return user ? ok(user) : error(new UserNotFoundError());
}
```

## Related & Optionally

For typed errors with exact, automatic type inference, optionally pair `@opinionated-ts/result` with `@opinionated-ts/error-factory` when available.
