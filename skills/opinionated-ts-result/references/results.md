# Result Constructors and Runtime Behavior

`@opinionated-ts/result` uses a small discriminated union:

```ts
type Success<T> = { ok: true; value: T };
type Failure<E extends Error = Error> = { ok: false; error: E };
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;
```

In normal application code, let `ok()` and `error()` infer the concrete types rather than annotating every return as `Result<T, E>`.

## Choose the right constructor

| Function         | Purpose                                 | Runtime behavior                                                                                                              |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ok(value)`      | Create a normalized result              | Recursively flattens nested successes and preserves failures, including failures nested inside successes                      |
| `error(cause)`   | Create a failure from an error or cause | Preserves an existing `Failure`; preserves an `Error` with a string `code`; otherwise wraps the value in `InvalidResultError` |
| `success(value)` | Wrap a success value                    | Wraps the value as-is; does not normalize nested results                                                                      |
| `failure(error)` | Wrap an error                           | Wraps the given `Error` as-is; does not validate its `code`                                                                   |

`ok()` and `error()` are the convenient public constructors for normalized outcomes. `success()` and `failure()` are lower-level constructors when explicit wrapping is desired.

## Typed errors need literal codes

A failure intended to be part of a precise TypeScript contract should extend `Error` and expose a literal string code:

```ts
class UserNotFoundError extends Error {
  readonly code = "USER_NOT_FOUND";
}
```

This preserves the discriminator in the inferred union, enabling autocomplete and exhaustive handling:

```ts
if (isFailure(result)) {
  switch (result.error.code) {
    case "USER_NOT_FOUND":
      return handleNotFound(result.error);
    default:
      result.error.code satisfies never;
  }
}
```

Avoid broad annotations such as `readonly code: string`. They erase the specific code from the static type.

## TypeScript and runtime are not identical

There are two important limits. Treat them as separate constraints, not as bugs that the library can fully eliminate.

### 1. TypeScript cannot type thrown values

A function's declared/inferred return type describes returned values. TypeScript does not add the values passed to `throw` to that return type:

```ts
function loadUser() {
  if (somethingFailed()) {
    throw new UserNotFoundError();
  }

  return { id: "123" };
}

// The inferred return type does not tell the caller that
// UserNotFoundError can be thrown.
```

As a result, thrown failures cannot participate in the normal inferred `Result` union. A caller may miss a failure unless it reads the implementation or documentation.

**Recommendation:** do not throw expected application failures. Return them explicitly with `error(new UserNotFoundError())`. When calling dependencies that may throw or reject, contain that behavior with [`tryResult()` and `tryResultAsync()`](./try-results.md), and map the cause to a typed error belonging to your operation.

### 2. TypeScript requires a literal code; runtime can only check for a string

At compile time, when an error is expected to satisfy the typed-error contract, `error()` and the `tryResult` helpers reject a `code` type widened to `string`. The type-level guard `ErrorCodeMustBeLiteralString` makes that contract incompatible (`code: never`), producing a TypeScript error. A literal such as `"USER_NOT_FOUND"` preserves the exact failure discriminator. An ordinary `Error` with no `code` is a different case: it can be accepted as an unknown cause and represented by `InvalidResultError`.

At runtime, JavaScript values do not carry TypeScript's distinction between a literal type and a widened string type. The runtime validator can only check that the value is an `Error` and that `code` is a string.

That means an error with a dynamically assigned string code may pass runtime validation when it arrives through JavaScript, unsafe casts, or another untyped boundary, even though equivalent typed TypeScript source would be rejected by the type checker with the `ErrorCodeMustBeLiteralString` contract. Runtime validation cannot prove that a code was a literal in the original source. `InvalidResultError` is the runtime fallback only when a value fails runtime validation (for example, it is not an `Error` or has no string `code`); it is not the runtime consequence of merely using a widened `string` type.

**Recommendation:** always define error codes as literals, preferably with `readonly code = "USER_NOT_FOUND"`. Do not rely on runtime acceptance as evidence that the static contract is precise.

## `error()` edge cases

```ts
error(new UserNotFoundError());
// Failure<UserNotFoundError> — valid literal code.

error(new Error("failed"));
// Failure<InvalidResultError> — plain Error has no valid code;
// the original Error is available as cause.

error("failed");
// Failure<InvalidResultError> — the string is available as cause.
```

The runtime behavior and the TypeScript overloads serve different purposes:

- A valid `Error` with a string `code` is preserved at runtime. TypeScript additionally requires the code to be statically narrow enough to preserve the exact contract.
- A non-`Error` value, or an `Error` without a string code, becomes the `cause` of an `InvalidResultError`.
- An existing `Failure` passed to `error()` is returned unchanged. This is an important edge case: `error()` does not inspect or repair the inner error of an already-created `Failure`. A malformed failure can therefore remain malformed if it came from untyped code or bypassed the type checker.
- `failure(error)` wraps any `Error` without runtime code validation. Use it only when you deliberately need the low-level constructor; it is not a substitute for the typed contract of `error()`.

## Normalization edge cases

`ok()` and `normalizeResult()` recursively flatten nested successes:

```ts
ok(ok(42));
// { ok: true, value: 42 }

ok(ok(error(new UserNotFoundError())));
// { ok: false, error: UserNotFoundError }
```

A failure is preserved even when nested inside one or more success values. By contrast:

```ts
success(ok(42));
// { ok: true, value: { ok: true, value: 42 } }
```

Use `success()` when wrapping as-is is intentional. Use `ok()` for canonical, normalized outcomes.

## Guards are structural checks

`isSuccess()` checks for a non-null object with a `value` property and `ok === true`. `isFailure()` checks for a non-null object with an `error` property and `ok === false`. They are structural type guards, not full schema validators: malformed values can pass the shape check.

The `satisfies never` pattern likewise checks a compile-time union; it does not validate untyped runtime data. Validate external data separately when it crosses a trust boundary.

## Related guides

- [Getting Started](./getting-started.md)
- [Try Results](./try-results.md)
- [Error Flow](./error-flow.md)
