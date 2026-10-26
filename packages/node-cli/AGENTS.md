# Node CLI guidance

## Ownership

`src/suitecloud.js` is the executable entry point. Command actions and input
handlers live under `src/commands/`; terminal UI belongs in `src/ui/`.
`src/core/` owns execution and SDK setup, with supporting services in `src/services/`.
Keep command metadata in `src/metadata/` consistent with handlers and help output.
Preserve message keys and interpolation contracts in `messages.json`.

Shared behavior comes from `@oracle/suitecloud-sdk-core` in `../sdk-core/`.
Use its public namespaces instead of importing generated internal files.
Rebuild core before checking CLI changes that depend on modified shared code.
Keep the package's core dependency version and bundled dependency declaration
consistent with the shared package and `../../scripts/pack-cli.js`.

## Reuse shared project behavior

Delegate reusable control-file discovery, parsing, normalization, and structural
validation to SDK core through its public API. Before adding filesystem probes,
XML parsing, project-type checks, constants, or validators, inspect core and
existing CLI services for an owner. If the needed shared capability is internal
or missing, extend core's focused public API rather than deep-importing its build
output or adding a second implementation in a CLI action.

Keep CLI configuration loading, command-specific project-folder resolution,
prompts, and presentation of errors here. Pass the resolved project folder to
core; do not independently infer it in each command. Existing `ProjectInfoService`
and `CLIConfigurationService` contain legacy control-file logic: when changing
that behavior, prefer delegation to the shared core owner while preserving their
caller contracts, command requirements, cache behavior, and error reporting.
Follow [core's shared-logic guidance](../sdk-core/AGENTS.md#shared-logic-and-control-files).

Reuse validation rules between interactive input handlers and noninteractive
actions where applicable. Keep prompts and error presentation specific to each
mode, and preserve operations intentionally delegated to Java. Consolidation must
not silently drop independent context errors or add unrelated validation to a
command. Rebuild core and check affected CLI paths when changing these contracts.

## Execution and error contracts

Preserve Java execution through an argument array with `shell: false` in
`SdkExecutor`; do not reintroduce shell interpolation or shell-specific quoting.
When changing argument handling, check paths with spaces and supported VM options.
Preserve the SDK download sequence: download to a temporary file, run the existing
artifact verification, then promote the file to its installed location. Clean up
failed downloads without replacing a working artifact.

For long-running commands, gate success on actual readiness, settle startup once,
and release owned resources on failure and shutdown. Remove process and service
listeners when their operation ends; test repeated execution in one process so
shutdown handlers cannot accumulate in IDE hosts or tests.

Reuse `src/utils/ErrorMessageUtils.js` when converting thrown values to action-result
messages. Preserve individual errors as a flat list rather than wrapping an existing
list in another array. Shared-service errors should use service-owned message keys
and retain the underlying cause for CLI and editor consumers.

## Prerequisites and installation

Read the [README prerequisites](README.md#prerequisites) and SDK compatibility
constants for supported Node.js and Java versions. Keep them aligned when changing
runtime requirements; preserve the supported versions for other changes.
`postinstall.js` invokes the license prompt and SDK download services in
`src/core/sdksetup/`. Installation can prompt for Oracle terms and download the
Java SDK artifact described by `package.json` metadata.
Do not automatically accept licensing or set the license-acceptance environment
variable on the user's behalf. Preserve the existing license and download checks.

## Verification and packaging

Run these commands from the repository root with workspace dependencies installed.
Jest tests live in `__test__/`, with configuration in `jest.config.js` and
interactive-boundary mocks in `__test__/setup.js`.

```sh
npm run build:sdk-core
npm run test --workspace @oracle/suitecloud-cli -- --runInBand
```

For packaging changes, use `npm run pack:cli`. This rebuilds core, stages the CLI,
installs core runtime dependencies with lifecycle scripts disabled, and creates
the bundled tarball in root `dist/` by default. It can require network access.
Keep `AGENTS.md` excluded through `.npmignore`.
Report Jest and packaging results separately from any live NetSuite verification.
