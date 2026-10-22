# SDK core guidance

## Ownership

This package owns the shared TypeScript implementation used by the Node CLI.
Keep reusable command behavior in `src/commands/`, authentication in `src/auth/`,
and shared services in `src/services/`; terminal interaction belongs in the CLI.
`src/api/`, `src/http/`, and `src/telemetry/` support those shared operations.

`src/index.ts` and `src/exports/` define the public namespaces consumed by
`@oracle/suitecloud-cli`: auth, commands, http, metadata, and telemetry.
Preserve those exports and their calling contracts when changing internals.
Check the CLI consumers and regression tests when changing shared behavior.

Edit project and SuiteScript resource templates under `resources/templates/`.
The build copies `resources/` into `build/resources/` using
`scripts/copy-resources.js`; change the source templates, not their copies.

## Build and compatibility

Run commands below from the repository root with workspace dependencies installed.
Build this package with `npm run build:sdk-core`.
The build cleans `build/`, compiles `src/` using `tsconfig.build.json`, and copies
resources. Generated JavaScript, declarations, and maps belong in `build/`.
Preserve the strict TypeScript settings and the CommonJS public entry point.

The package's `files` allowlist publishes only `build/` plus npm's automatic
metadata inclusions. Keep package-root contributor guidance outside that output.
`npm run pack:cli` rebuilds and bundles this package into the CLI artifact.

## Verification

SDK-core regression tests currently live in `../node-cli/__test__/`.
Rebuild core before running those tests so they exercise the changed code:

```sh
npm run build:sdk-core
npm run test --workspace @oracle/suitecloud-cli -- --runInBand
```

The build verifies compilation; the CLI Jest suite verifies shared behavior
through its existing tests. Neither check establishes live NetSuite behavior.
