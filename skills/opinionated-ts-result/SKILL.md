---
name: opinionated-ts-result
description: "Use when implementing, reviewing, or explaining TypeScript code with `@opinionated-ts/result` for handling errors as typed values instead of throwing, including `ok`, `error`, `isSuccess`, `isFailure`, failure propagation, and exhaustive error handling."
---

# @opinionated-ts/result

`@opinionated-ts/result` represents expected operation outcomes explicitly as typed `Result` values.

The API is:

- `ok(value)` — success.
- `error(error)` — failure.
- `isSuccess(result)` — narrows to success.
- `isFailure(result)` — narrows to failure.

## Result shape

```ts
type Result<T, E extends Error = Error> = { ok: true; value: T } | { ok: false; error: E };
```

Normally, let `ok()` and `error()` infer the concrete success and failure types.

```ts
function validateUser(user: User) {
  if (user.blocked) {
    return error(new UserBlockedError());
  }

  return ok(user);
}
```

Do not explicitly annotate the return type as `Result<...>`.

## Typed errors

Use `error()` with a concrete, intentionally typed `Error`:

```ts
return error(new UserNotFoundError());
```

Do not expose generic causes directly:

```ts
return error(cause);
```

Translate external or generic causes into the specific failure of the current operation:

```ts
try {
  const user = await database.findUser(id);

  if (!user) {
    return error(new UserNotFoundError());
  }

  return ok(user);
} catch (cause) {
  return error(new UserLoadFailedError("Could not load user.", { cause }));
}
```

Keep the concrete error union visible through inference.

## Adapting exception-based operations

Use `tryResult()` or `tryResultAsync()` when an operation can throw or reject:

```ts
const result = await tryResultAsync(
  () => database.findUser(id),
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

The optional mapper receives the original caught value as `unknown`. Its return value is passed to `error()`, so an existing `Failure` is preserved. If the mapper throws, its exception propagates. Without a mapper, non-nullish thrown/rejected values are preserved as failures; `null` and `undefined` cause `NullishFailureError` to be thrown.

When both the caught value and the mapped value are `Error` instances, the helper copies the original error stack to the mapped error by default if the original stack exists. Pass `{ inheritStack: false }` as the third argument to disable this behavior. The mapper must return a concrete, non-nullish failure value; TypeScript checks this contract, but the helper does not validate values supplied through untyped code or unsafe casts.

## Consuming Results

Use the exported guards rather than checking `result.ok` manually:

```ts
const result = await operation();

if (isSuccess(result)) {
  return process(result.value);
}

return handleFailure(result.error);
```

Propagate failures unchanged when appropriate:

```ts
const result = await operation();

if (isFailure(result)) {
  return result;
}

return process(result.value);
```

## Propagation and translation

Propagate a failure unchanged when the current layer does not change its meaning:

```ts
async function getUser(id: string) {
  const result = await loadUser(id);

  if (isFailure(result)) {
    return result;
  }

  return validateUserAccess(result.value);
}
```

Translate only when the current layer intentionally changes its meaning:

```ts
if (isFailure(result)) {
  return error(
    new ApplicationLoadError("Unable to load user.", {
      cause: result.error,
    }),
  );
}
```

Do not reconstruct or wrap failures without a semantic reason.

## Exhaustive handling

Keep the inferred error union precise until the boundary:

```ts
if (isFailure(result)) {
  switch (result.error.code) {
    case "NOT_FOUND":
      return handleNotFound(result.error);

    case "BLOCKED":
      return handleBlocked(result.error);

    case "LOAD_FAILED":
      return handleLoadFailed(result.error);

    default:
      result.error.code satisfies never;
      return handleUnexpectedError(result.error);
  }
}
```

`satisfies never` is a compile-time exhaustiveness check: adding a new error to the union requires a corresponding case.

The runtime fallback is separate protection for values that violate the TypeScript contract, such as untyped code, unsafe casts, malformed values, or incompatible implementations.

At an external boundary, map the final `Result` to the required representation:

```ts
const result = await getUser(userId);

if (isSuccess(result)) {
  return Response.json(result, { status: 200 });
}

logError(result.error);

switch (result.error.code) {
  case "NOT_FOUND":
    return Response.json(result, { status: 404 });

  case "BLOCKED":
    return Response.json(result, { status: 403 });

  case "LOAD_FAILED":
    return Response.json(result, { status: 500 });

  default:
    result.error.code satisfies never;

    return Response.json(
      error(
        new UnexpectedApplicationError({
          cause: result.error,
        }),
      ),
      { status: 500 },
    );
}
```

Expected failures stay inside `Result`; constructors infer concrete types; failures are propagated unchanged unless translation is required; final consumers handle the union exhaustively.

## Flow

```text
operation
   ↓
inferred Result
   ↓
propagate / translate
   ↓
inferred Result
   ↓
boundary
   ↓
exhaustive handling
```

## Related & Optionally

Optionally, see the [`@opinionated-ts/result`](https://github.com/opinionated-ts/result) repository for more in-depth guidance about the package, only if this skill does not answer your question or you need additional details.

For typed errors with exact, automatic type inference, optionally pair `@opinionated-ts/result` with `@opinionated-ts/error-factory` when available.
