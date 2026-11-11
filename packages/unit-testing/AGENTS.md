# Unit-testing package guidance

## Ownership

This package supplies Jest configuration and SuiteScript stubs to consuming
SuiteCloud projects. The public configuration entry point is
`jest-configuration/SuiteCloudJestConfiguration.js`.
It maps SuiteScript module names, project folders, and custom stubs for Jest.
Supporting project inspection belongs in `services/` and shared helpers in `utils/`.

`jest-configuration/SuiteCloudJestTransformer.js` uses `babel-jest`, the Babel
environment preset, and AMD-to-CommonJS transformation to load SuiteScript.
Preserve compatibility with AMD `define` modules and existing consumer imports.
Keep ACP and SuiteApp project layouts, root resolution, and custom-stub overrides
working when changing configuration generation.

SuiteScript mocks live under `stubs/`. Consult the
[stub documentation](stubs/README.md) before changing module coverage or exports.
Keep configuration module mappings consistent with stub paths and exported shapes.
Stubs support isolated tests; they do not reproduce the NetSuite runtime.
Preserve existing SuiteScript signatures and licensing when editing them.

## Consumer verification

The [README](README.md) describes consuming-project setup and custom stub examples.
This package currently defines no build or test script in `package.json`.
Use relevant consuming-project Jest tests to verify behavior changes.
For configuration or transformer changes, exercise the affected project layout,
module resolution, and AMD loading. For stub changes, exercise the affected
module and mock behavior in a consumer.

Report which consuming project and checks ran, and the scope they cover.
If no suitable consumer is available, report that verification gap explicitly.
Checks in unrelated packages do not establish this package's consumer compatibility.

## Packaging

Keep the configuration, transformer, resources, and stubs available to consumers.
`.npmignore` preserves applicable repository ignore rules and excludes `AGENTS.md`.
For packaging changes, inspect `npm pack --dry-run --ignore-scripts --json` from
this package and compare its file inventory with the prior inventory.
