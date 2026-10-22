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

## Prerequisites and installation

The [README](README.md) lists Node.js 24 LTS and Oracle JDK 17 or 21.
Preserve compatibility with those documented prerequisites.
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
