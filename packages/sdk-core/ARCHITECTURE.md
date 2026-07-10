# SDK Core Architecture

`sdk-core` uses explicit boundaries so command-line concerns do not leak into transport,
filesystem, or response-normalization code.

## Boundaries

- `src/api`: stable command inputs, results, and constants.
- `src/actions`: use-case orchestration. Actions validate input, coordinate services, and
  normalize failures without owning transport or filesystem details.
- `src/services`: reusable infrastructure and domain services. HTTP, proxy, archive,
  project, file, and object implementations live here.
- `src/commands`: compatibility facades and CLI-oriented handlers. Existing imports stay
  stable while implementations move behind the boundaries above.
- `src/exports`: the public package surface. New internal modules are not public unless
  deliberately exported here.

Dependencies point inward: commands call actions or services; actions depend on API
contracts and service interfaces; services use the centralized HTTP/proxy boundary.
Infrastructure must not import CLI packages.

## Dependency injection

Use constructor or function injection at action boundaries. Do not introduce a dependency
injection framework. Production factories provide defaults, while tests can pass small
service doubles through the same interfaces.

## Compatibility

Refactors must preserve the package exports in `src/exports` and the command facades in
`src/commands`. Move behavior behind a facade before changing its internals.

## Verification

Run gates sequentially because the build begins by deleting `packages/sdk-core/build`:

```sh
npx tsc -p packages/sdk-core/tsconfig.build.json --noEmit
npm run build
npm test --workspace @oracle/suitecloud-cli -- --runInBand
```

Account-backed integration tests live in the separate
`suitecloud-cli-integration-tests` repository. They replace the CI credentials file during
setup and may update the configured test account, so confirm the target account before a
full run.
