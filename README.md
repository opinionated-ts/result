# @opinionated-ts/result

[![npm version](https://img.shields.io/npm/v/@opinionated-ts/result)](https://www.npmjs.com/package/@opinionated-ts/result)
[![npm downloads](https://img.shields.io/npm/dm/@opinionated-ts/result)](https://www.npmjs.com/package/@opinionated-ts/result)
[![CI](https://img.shields.io/github/actions/workflow/status/opinionated-ts/result/check-and-release.yml?label=CI)](https://github.com/opinionated-ts/result/actions/workflows/check-and-release.yml)
[![License](https://img.shields.io/github/license/opinionated-ts/result)](https://github.com/opinionated-ts/result/blob/main/LICENSE)

Make operation outcomes explicit with **typed `Result` values** instead of hiding expected failures in thrown exceptions.

The important part is not the `Result` shape. It is the contract it gives the caller: **TypeScript can infer exactly what a function can return, including its possible failures.**

> ❤️ If you find this project useful, consider giving the repo a star — it helps support the project.

## Why

With thrown errors, a function's return type tells you what happens when it succeeds, but not which failures can occur.

You may know that a function returns a `User`, while the errors it can throw remain invisible to TypeScript. To discover those failures, you have to read the implementation, documentation, or rely on runtime behavior.

`@opinionated-ts/result` makes those outcomes part of the function's inferred contract.

### Exact Contracts

A function can expose both its success value and its concrete failures directly through its return type:

```ts
import { error, ok } from "@opinionated-ts/result";

class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND";
}

class UserBlockedError extends Error {
  readonly code = "BLOCKED";
}

function getUser(id: string) {
  const user = users.get(id);

  if (!user) {
    return error(new UserNotFoundError());
  }

  if (user.blocked) {
    return error(new UserBlockedError());
  }

  return ok(user);
}
```

From outside the function, TypeScript can infer the complete contract:

```ts
const result = getUser(id);
```

In editors like **VS Code**, a **mouse hover** over `result` can show that it contains either the successful `User` value or one of the concrete failures returned by `getUser()`.

The caller does not need to inspect the implementation to discover what can go wrong.

### No Manual Result Annotations

The contract comes directly from the values returned by `ok()` and `error()`:

```ts
function getUser(id: string) {
  // return ok(...) or error(...)
}
```

As the function changes, its inferred contract changes with it.

### Let TypeScript Surface What Changed

Because the concrete failures remain part of the type, new possibilities can become compiler-visible to their consumers.

```ts
const result = getUser(id);

if (isSuccess(result)) {
  return result.value;
}

switch (result.error.code) {
  case "NOT_FOUND":
    return handleNotFound();

  case "BLOCKED":
    return handleBlocked();

  default:
    result.error.code satisfies never;
}
```

With the failure `code` preserved as a literal value (for example, with `readonly`), pressing **Ctrl + Space** in VS Code can suggest the concrete codes available for the `switch`.

If `getUser()` later starts returning another failure, that new possibility becomes part of the inferred contract. The exhaustive check then stops satisfying `never`, giving the compiler a chance to surface the new case instead of letting it pass unnoticed.

### Keep Contracts Precise Across Layers

A typed failure can move through application layers without losing its concrete type.

A layer can keep an existing failure when it is still the right contract, or intentionally replace it when the abstraction exposed to the caller changes.

This keeps the final error union precise all the way to the boundary where the application decides how to represent it.

## Guides

- [Getting Started](./docs/getting-started.md) — learn the core contract, creation, consumption, propagation, and error translation.
- [Error Flow](./docs/error-flow.md) — follow typed failures through application layers and handle the final error union exhaustively.
- [Install the `opinionated-ts-result` skill](https://github.com/opinionated-ts/result/tree/main/skills) — add this package's guidance to your coding agent.

## Related

This project is part of the [Opinionated TS](https://github.com/opinionated-ts) ecosystem, and here are some related projects:

- [`@opinionated-ts/error-factory`](https://github.com/opinionated-ts/error-factory) — Type-safe functional error factories with automatic and exact type inference for TypeScript.

## Open Source for the Community

Every project of the [Opinionated TS](https://github.com/opinionated-ts) ecosystem is **open source** and **free** for anyone to explore, use, or build on.

**Contributions are more than welcome — they're the whole point.**

- 💬 **Found a bug?** Open an issue.
- ✨ **Have an idea?** Start a discussion.
- 🔧 **Want to improve something?** Send a PR.

Whether it's a typo, a bug fix, a new feature, or an improvement — every contribution helps a lot.

## License

MIT
