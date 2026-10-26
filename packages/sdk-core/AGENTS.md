# SDK core guidance

## Ownership

This package owns the shared TypeScript implementation used by the Node CLI.
Keep reusable command behavior in `src/commands/`, authentication in `src/auth/`,
and shared services in `src/services/`; terminal interaction belongs in the CLI.
`src/api/`, `src/http/`, and `src/telemetry/` support those shared operations.

`src/index.ts` and `src/exports/` define the public namespaces consumed by
`@oracle/suitecloud-cli`; consult them for the exports available on the target branch.
Preserve those exports and their calling contracts when changing internals.
Check the CLI consumers and regression tests when changing shared behavior.

Edit project and SuiteScript resource templates under `resources/templates/`.
The build copies `resources/` into `build/resources/` using
`scripts/copy-resources.js`; change the source templates, not their copies.

## Shared logic and control files

Before adding a reader, validator, constant, or data type, search existing core
services and CLI consumers for the same behavior. Extend the owning service when
the semantics match. Keep reusable project logic in core and terminal interaction
in the CLI; avoid parallel implementations in individual commands.

Control-file discovery, parsing, normalization, and structural validation should
have one owner under `src/services/project/`. Route manifest, deploy, and application
file consumers through that owner where possible. Inspect the target branch for
the existing project service before choosing an API; the available services can
differ between release and development branches. Consolidate relevant readers
when changing this behavior rather than adding another filename probe, XML regex,
parser, or project-type check. Keep format-specific handling behind the shared API
so consumers use the same normalized model for supported formats.

Keep discovery, parsing, and validation responsibilities explicit in API names
and contracts. Share structural rules while keeping command-specific requirements
explicit: a command that needs only a manifest must not acquire unrelated deploy
requirements. Preserve missing/invalid-file diagnostics and independent validation
errors; skip dependent checks when their prerequisite data is invalid. Validate
before copying or overwriting project files.

Reuse canonical manifest types, project-type constants, and derived-value helpers
instead of creating command-local clones. Pass an already resolved project context
or parsed model through an operation where practical. Preserve existing cache
scope and freshness behavior when consolidating readers; avoid global caches that
can leak data between projects or retain stale control-file contents. Expose only
the shared operations and types consumers need through `src/exports/`.

Package, deploy, dry-run, and validate should reuse the same archive planning and
creation flow where their semantics match. When consolidating behavior, verify
affected command consumers, supported formats and project types, invalid/missing
files, path handling, and unchanged error contracts with focused regression tests.
Do not broaden an unrelated change into a repository-wide refactor.

## Portable operations and input contracts

Use the existing Node-based archive service in `src/services/archive/` instead of
requiring system `zip` or `unzip` commands. Reuse path-resolution and containment
helpers in `src/services/project/ProjectPathResolver.ts` where applicable. Check
Windows paths and relevant symlink cases when changing filesystem behavior.

Normalize caller inputs into a separate value rather than deleting or rewriting
properties on the supplied object. Keep predicates, throwing validators, and
operation-result APIs explicit and consistent with their callers; avoid an
ambiguous success-value-or-error contract.

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
