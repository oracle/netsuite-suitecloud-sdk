# UIF types guidance

## Ownership

This package supplies NetSuite UI Framework TypeScript declarations.
`uif/index.d.ts` loads `uif/core.d.ts` and `uif/component.d.ts`.
Edit those declarations as the source of the package's API descriptions.
Keep ambient module names, public exports, and cross-file type references aligned.
Preserve existing copyright notices and the package's UPL licensing.

## API accuracy and compatibility

Declarations must describe supported framework behavior: constructors, overloads,
properties, callbacks, generics, and return types must match the relevant API.
Do not infer a new runtime capability from a desired TypeScript usage pattern.
Check the corresponding framework API before adding or widening a declaration.
Consider existing consuming code when narrowing types or changing overloads;
declaration-only changes can still break compilation for consumers.

The [README version mapping](README.md#versioning) ties package major versions
to NetSuite releases, with a new major version every six months.
Use the mapping to identify the intended API release when assessing a change.
Keep version and release-mapping changes within their separately authorized scope.

## Consumer verification

This package currently defines no build or test script in `package.json`.
Verify declaration changes with TypeScript in a representative consuming
SuiteApp project using UIF and the package's documented type-root setup.
Exercise the changed API usage as well as relevant existing consumer usage.
Report the consumer, TypeScript version, command, and result so the scope is clear.
If a representative consumer is unavailable, report that verification gap.
Compilation verifies types; it does not establish NetSuite runtime behavior.

## Packaging

Preserve the declaration files, README, image, and license shipped to consumers.
Keep `AGENTS.md` excluded through `.npmignore`.
For packaging changes, compare `npm pack --dry-run --ignore-scripts --json`
inventories from this package before and after editing.
