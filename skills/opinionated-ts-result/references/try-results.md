# Try Results

`tryResult()` and `tryResultAsync()` contain exceptions and promise rejections at a boundary, then return a typed `Result` instead of letting the failure escape.

- `tryResult(() => operation())` runs a synchronous factory.
- `await tryResultAsync(() => operation())` runs an asynchronous factory and catches both synchronous throws during invocation and promise rejections.

Use these helpers around code that may throw. For expected failures in your own business logic, prefer returning `error(new SpecificError())` directly.

## Map a cause to an operation-specific error

The optional mapper receives `cause: unknown` and must return an `Error` with a literal string `code`:

```ts
class UserLoadFailedError extends Error {
  readonly code = "USER_LOAD_FAILED";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

// oxfmt-ignore
const result = await tryResultAsync(() => {
    // Additional preparation can go here.
    return database.findUser(id);
  },
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

The inferred result is the success type plus the concrete mapped failure type. No explicit `Result<User, UserLoadFailedError>` annotation is needed.

The mapper's input is `unknown` intentionally: JavaScript permits throwing any value, not just `Error` instances. Narrow the cause before accessing error-specific properties.

## Without a mapper

```ts
const result = tryResult(() => readConfig());
```

If the factory succeeds, its value becomes a normalized success. If it throws and no mapper is supplied, the failure becomes `InvalidResultError`. The original thrown value is retained as `cause`.

The output type uses `Failure<InvalidResultError>` when no mapper is supplied or the mapper's declared return type is invalid. If the mapper's `code` widens to `string`, TypeScript rejects the contract through `ErrorCodeMustBeLiteralString` (`code: never`); that is a compile-time error, not a runtime conversion. With a valid mapper, its concrete error type is inferred. Runtime fallback to `InvalidResultError` is still possible if JavaScript, an unsafe cast, or a bug violates the mapper's declared contract; that runtime fallback cannot always be represented in the statically inferred type.

## Returned values are normalized too

The helpers do more than catch exceptions. They validate and normalize the factory's returned/resolved value:

- An ordinary value becomes `Success<value>`.
- Nested successes are flattened.
- A valid `Failure` is preserved.
- A `Failure` whose inner error is invalid is mapped using that inner error as the cause, or falls back to `InvalidResultError`.
- A directly returned `Error` with a string `code` becomes a `Failure`.
- A directly returned `Error` without a string `code` is mapped or wrapped in `InvalidResultError`.
- A returned `Success` containing a failure is normalized, and the resulting failure is validated.

For example, returning a valid failure does not call the mapper:

```ts
const failure = error(new UserNotFoundError());

const result = tryResult(() => failure);
// The existing valid failure is preserved.
```

A mapper is not a general-purpose transformation of every returned value. Ordinary successful values pass through without invoking it.

## Runtime validation and fallback behavior

The mapper must return an `Error` with a string `code` at runtime. TypeScript requires the code to be a literal type, but runtime cannot determine whether the string was a literal in the original TypeScript source. See [TypeScript and runtime are not identical](./results.md#typescript-and-runtime-are-not-identical).

The following situations produce `InvalidResultError`:

- No mapper was provided for a thrown/rejected cause.
- The mapper returns a value that is not a valid result error.
- The mapper itself throws; the mapper's thrown value becomes the fallback error's `cause`.
- A returned or thrown failure contains an invalid inner error and no valid mapping is produced.

A valid existing result error is preserved without invoking the mapper. A thrown or rejected `Error` is not automatically considered valid: it must have a string `code` to pass runtime validation.

## Stack inheritance

`TryResultOptions` supports one option:

```ts
tryResult(factory, mapper, { inheritStack: false });
tryResultAsync(factory, mapper, { inheritStack: false });
```

- `inheritStack` defaults to `true`.
- When enabled, the resulting mapped error or fallback error inherits the stack from the original cause.
- Set it to `false` to retain the stack produced by the mapped/fallback error instead.

This changes stack presentation, not the error's type or `cause`.

## Important TypeScript limitation: thrown types are not inferred

TypeScript does not include values thrown with `throw` in a function's return type. The mapper is how you make the failure visible in the returned `Result` contract.

Prefer not to throw expected application errors. Return `error(new SpecificError())` instead. Use `tryResult()` and `tryResultAsync()` to contain exceptions from dependencies or APIs you do not control, translating unknown causes into a concrete error for the current operation.

Also always define `code` as a literal, for example `readonly code = "USER_LOAD_FAILED"`. A runtime string check cannot guarantee the static precision needed for autocomplete and exhaustive `switch` handling.

## Sync and async examples

```ts
const syncResult = tryResult(
  () => readConfig(),
  (cause) => new ConfigLoadFailedError("Could not read config.", { cause }),
);

const asyncResult = await tryResultAsync(
  () => fetchUser(id),
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

The async mapper may return the typed error directly; the mapper itself is not an async callback.

## Related guides

- [Result constructors and runtime behavior](./results.md)
- [Getting Started](./getting-started.md)
- [Error Flow](./error-flow.md)
