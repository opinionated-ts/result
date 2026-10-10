# Error Flow

`Result` keeps concrete failures visible as operations move through application layers. Let constructors infer the contract and preserve an existing failure when its meaning is still appropriate.

## Propagate failures

```ts
async function getUser(id: string) {
  const result = await loadUser(id);

  if (isFailure(result)) return result;

  return validateUserAccess(result.value);
}
```

Do not reconstruct or wrap a failure merely because it crossed another function. Returning it unchanged preserves its concrete error type.

## Translate only when the contract changes

Translation is appropriate when a layer intentionally hides an internal error, exposes a safer public error, or changes the failure to match its own operation:

```ts
const result = await repository.load(id);

if (isFailure(result)) {
  return error(
    new UserLoadFailedError("Unable to load user.", {
      cause: result.error,
    }),
  );
}

return ok(result.value);
```

The original error may be preserved as `cause`, transformed, or omitted depending on what the current layer should expose.

## Preserve inference

Avoid widening the return type to `Result<User, Error>` when the implementation knows the concrete failure types. Prefer returning `ok()` and `error()` branches and letting TypeScript infer the union.

## Handle the union exhaustively

```ts
const result = await getUser(id);

if (isSuccess(result)) return result.value;

switch (result.error.code) {
  case "NOT_FOUND":
    return handleNotFound(result.error);
  case "BLOCKED":
    return handleBlocked(result.error);
  case "LOAD_FAILED":
    return handleLoadFailed(result.error);
  default:
    result.error.code satisfies never;
}
```

The `satisfies never` check detects missing cases in the **static union**. It is not runtime validation and cannot protect against arbitrary untyped values, unsafe casts, malformed objects, or values thrown from code whose failures are absent from its return type.

## Runtime and static contracts

Two limits must remain explicit:

- TypeScript does not include `throw` values in a function's return type. A function can throw an error without the caller's inferred type revealing it. Prefer returning expected failures as `Result` values; use [Try Results](./try-results.md) at boundaries where dependencies may throw or reject.
- TypeScript requires a literal error `code` to preserve a precise union, but runtime validation only checks that the value is an `Error` with a string `code`. A widened string may pass runtime checks when values come from JavaScript, unsafe casts, or other untyped boundaries even though TypeScript rejects it as a typed contract.

For predictable behavior, do not throw expected application errors: return them through `error()`, and give every typed error a literal code, such as `readonly code = "NOT_FOUND"`. See [Result constructors and runtime behavior](./results.md#typescript-and-runtime-are-not-identical).

## Keep representation at the boundary

The operation defines the possible outcomes; the outer boundary decides how to represent them:

```ts
const result = await getUser(id);

if (isSuccess(result)) {
  return Response.json(result.value, { status: 200 });
}

return Response.json(
  { error: result.error.message, code: result.error.code },
  { status: getStatus(result.error) },
);
```

The same contract can be mapped to a response, CLI exit code, UI state, or message.

## Next steps

- [Result constructors and runtime behavior](./results.md)
- [Try Results](./try-results.md)
