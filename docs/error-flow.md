# Error Flow

`Result` keeps concrete failures visible as operations move through application layers.

## Propagate failures

When a layer does not change the meaning of a failure, return the existing result unchanged:

```ts
async function getUser(id: string) {
  const result = await loadUser(id);

  if (isFailure(result)) {
    return result;
  }

  return validateUserAccess(result.value);
}
```

The current function inherits the failure types already present in `result`. Do not reconstruct or wrap a failure merely because it crossed another function.

## Translate failures

Translate a failure only when the current layer genuinely needs to replace the error exposed to its caller.

Do not create a new error merely because a failure crossed a layer or can be described differently. If the existing error is still appropriate for the caller, propagate it unchanged.

Translation may be appropriate when the original error must be intentionally hidden, replaced with a safer public error, or converted into a different failure that the current operation actually needs to expose.

For example, a layer may translate an internal failure into a public error:

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

This example keeps the original failure as `cause`, but that is only one possible implementation. A translated error may preserve, transform, or omit information from the original failure depending on what the current layer needs to expose.

When no such translation is necessary, keep the original failure:

```text
failure is still appropriate → propagate

failure must be intentionally replaced → translate
```

## Preserve concrete failures

Keep the concrete error union visible to callers instead of widening it to `Error`:

```ts
// Bad Example
function getUser(id: string): Result<User, Error> {
  // ...
}
```

Prefer letting the `ok()` and `error()` branches determine the type:

```ts
// Good Example
function getUser(id: string) {
  // return ok(...) or error(...)
}
```

Inference then carries the actual failure union through each layer that propagates or adds failures.

## Handle the union exhaustively

At the consumer that owns the decision, narrow the failure and handle its discriminator:

```ts
const result = await getUser(id);

if (isSuccess(result)) {
  return result.value;
}

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
```

`satisfies never` makes the concrete error union a compile-time exhaustiveness check. Adding another typed failure requires a corresponding case.

The check protects the TypeScript contract. An outer runtime boundary may still keep defensive handling for malformed or untyped values that violate it.

## Keep representation at the boundary

The operation describes what can happen. The boundary decides how the final result is represented externally:

```ts
const result = await getUser(id);

if (isSuccess(result)) {
  return Response.json(result, { status: 200 });
}

return Response.json(result, {
  status: getStatus(result.error),
});
```

The same result can instead become a CLI exit code, UI state, message, or another external representation without changing the operation's failure contract.

## Next steps

- [Install the `opinionated-ts-result` skill](https://github.com/opinionated-ts/result/tree/main/skills) — add package-specific guidance to your coding agent.
