---
name: opinionated-ts-result
description: "Use when implementing, reviewing, or explaining TypeScript code with @opinionated-ts/result, including typed Results, ok/error, isSuccess/isFailure, failure propagation, and exhaustive error handling."
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

## Related

## For typed error creation and reusable error definitions, optionally pair `@opinionated-ts/result` with `@opinionated-ts/error-factory`.
