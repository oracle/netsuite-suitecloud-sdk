# SuiteScript 2.0/2.x to 2.1 Compatibility Rules
> Author: Oracle NetSuite

This reference documents the SuiteScript 2.0/2.x to 2.1 compatibility rules used by the Babel converter in `C:\webdev\suitescript-converter`.

Use this file only for existing SuiteScript 2.0 or 2.x AMD scripts. SuiteScript 1.0 migrations still use `api-mapping.json`, `object-mapping.json`, `script-type-changes.md`, `breaking-changes.md`, and `unmapped-apis.md`.

## Conversion Goal

SuiteScript 2.1 is the only target. For SuiteScript 2.0/2.x inputs, preserve the existing SuiteScript 2.x module/API structure and apply compatibility rewrites for JavaScript syntax, built-in behavior, stricter 2.1 validation, and SuiteScript API availability at define-callback evaluation time.

Do not use the SS1.0 API migration rules for a clean SS2.0/2.x script unless the file also contains `nlapi*` or `nlobj*` remnants.

## Rule Order

Apply the 2.x compatibility rules in the same conceptual order as the Babel pipeline:

1. Parser compatibility rewrites: conditional catch, `for each`, reserved identifiers.
2. Version tag normalization.
3. Runtime behavior preservation: const reassignment, JSON parsing, Error properties, date formatting, parseInt behavior, RESTlet POST return values.
4. SuiteScript API evaluation rewrites: API-backed enum declarations, top-level API-backed declarations, returned module properties.
5. Script-type validation rewrites: fallback entrypoint injection.
6. Define dependency cleanup.

## Rule Matrix

| Rule | Detect | Convert | Helper | Review |
|---|---|---|---|---|
| `@NApiVersion` | `2.0`, `2.x`, or `2.X` in a file with `define()` | Replace with `2.1`; this includes `PlugInTypeImpl` scripts | No | Low |
| Conditional catch | `catch (e if condition)` | Move condition inside a standard `catch`; multiple conditional catches become an `if` / `else if` chain with final `throw e` | No | Medium |
| `for each` | Rhino `for each (... in ...)` | Use key iteration and assign the value from the object/array; when the right side is not an identifier, store it in a temp variable first | No | Medium |
| Reserved identifiers | Reserved words used as identifiers | Rename to `__ss2_reserved_<word>` | No | Medium |
| Const reassignment | Assignment to a `const` binding | Wrap the assignment in `try/catch` | No | Medium |
| `JSON.parse` | Any `JSON.parse(...)` call | Replace with `ssConverterHelper.jsonParse_legacySS20(...)` | Yes | Medium |
| `parseInt` | `parseInt(x)` with exactly one argument | Replace with `ssConverterHelper.parseInt_legacySS20(x)` | Yes | Medium |
| Error constructors | `new Error(...)` and native error constructors with arguments | Instantiate without args, then assign `message`, `fileName`, `lineNumber`, or option properties as enumerable assignments | No | Medium |
| Date formatting | `.toLocalDateString(...)` | Use `Intl.DateTimeFormat(localeOrDefault, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)` | No | Low |
| RESTlet POST return | `@NScriptType Restlet` and direct `post` return statements | Wrap return expression in `JSON.stringify(...)` | No | Medium |
| Top-level API values | Stable top-level declarations derived from define dependencies | Convert declaration to a zero-arg factory and rewrite reads | No | High |
| API enum objects | Object literals whose values are all enum members from one API dependency | Convert object to a zero-arg factory and rewrite member reads | No | High |
| Returned module properties | Returned non-function properties in `@NScriptType` or `@NModuleScope` modules when the value depends on define dependency bindings | Convert property value to a zero-arg factory; rewrite `this.prop` reads to `this.prop()` | No | High |
| Missing entrypoint | Known script type returns no valid entrypoint | Inject no-op fallback entrypoint | No | High |
| `.js` dependencies | Non-`N/*` strings ending in `.js` in `define([...])` | Remove `.js` suffix | No | Low |

## Helper Module

The converter injects a relative `define()` dependency ending in `SuiteScriptConverter/SSConverterHelper` without the `.js` suffix when a converted file needs helper-backed behavior. The project converter creates/deploys the physical helper file at `SuiteScriptConverter/SSConverterHelper.js`.

Helper-backed rules:
- `JSON.parse(...)` -> `ssConverterHelper.jsonParse_legacySS20(...)`
- `parseInt(x)` -> `ssConverterHelper.parseInt_legacySS20(x)`

Fallback entrypoint injection, API factory rewrites, RESTlet `post` return wrapping, date formatting, Error constructor rewrites, and dependency cleanup do not require `SSConverterHelper` and must not be treated as helper-backed rules.

The helper module exports:
- `jsonParse_legacySS20`
- `parseInt_legacySS20`

Deployment guidance must verify that the helper file is deployed and covered by `deploy.xml`.

## Important Compatibility Notes

- The `@NApiVersion` rule runs only when a `define()` call exists in the file. The converter also normalizes SuiteScript plugin type implementation scripts declared as `@NScriptType PlugInTypeImpl`.
- `JSON.parse` compatibility only preserves trailing comma tolerance in otherwise valid JSON. It does not make invalid JSON valid.
- One-argument `parseInt` calls are rewritten to preserve SuiteScript 2.0 trailing-zero behavior. Calls with an explicit radix and zero-argument calls are kept.
- `.toLocalDateString()` without arguments uses `en-US`; a string locale argument is preserved; extra formatting options are ignored.
- Error constructor rewrites apply to native error constructors such as `Error`, `TypeError`, `RangeError`, `ReferenceError`, `SyntaxError`, `URIError`, and `EvalError`. Constructor calls without arguments are kept.
- RESTlet `post` return expressions are wrapped in `JSON.stringify(...)` even when the expression is already a `JSON.stringify(...)` call.
- Top-level API-backed declarations are converted only when they are stable. Reassigned declarations are kept and should be reviewed manually.
- API-backed return properties are converted only when they depend on define dependency bindings. Static literal return properties are preserved.
- Missing entrypoint injection keeps deployment validation moving, but the generated fallback must be reviewed and implemented if the script actually needs behavior. It never implies `SSConverterHelper` deployment.
- Non-`N/*` `.js` dependency suffixes are removed only in `define([...])`, not in arbitrary arrays or `require([...])`.

## Plugin Deployment Blockers

The Babel converter normalizes SuiteScript files declared as `@NScriptType PlugInTypeImpl`, but it does not rewrite SDF object XML plugin definitions.

When a converted SuiteScript 2.1 project contains SDF objects such as `platformextensionplugin`, report them as possible SuiteApp deployment blockers. Mention `plugintypeimpl` only as a manual remediation path to evaluate with the owning NetSuite implementation. Do not automatically rewrite `platformextensionplugin` objects to `plugintypeimpl`.

Include plugin blockers in the conversion or upgrade report under manual-review deployment items.

## Generated Legacy Code Content

Some SuiteScript 2.x or 2.1 files generate SuiteScript 1.0-looking JavaScript as string content, template literals, HTML/client payloads, or file output. Treat that content as generated legacy code, not executable source in the current file.

When SS1.0-looking syntax appears only inside generated string content:
- Report it as generated legacy content or deployment risk.
- Do not apply SS1.0 API/object mappings to the string body automatically.
- Do not use generated string content as evidence that the surrounding file should follow the SS1.0 migration path.
- Include the finding in the conversion report under manual-review items.

## Fallback Entrypoints

| Script Type | Valid Entrypoints | Fallback |
|---|---|---|
| ClientScript | `pageInit`, `saveRecord`, `fieldChanged`, `postSourcing`, `lineInit`, `validateField`, `validateLine`, `validateInsert`, `validateDelete`, `sublistChanged`, `localizationContextEnter`, `localizationContextExit` | `pageInit` |
| UserEventScript | `beforeLoad`, `beforeSubmit`, `afterSubmit` | `beforeLoad` |
| Suitelet | `onRequest` | `onRequest` |
| Restlet | `get`, `post`, `put`, `delete` | `get` |
| ScheduledScript | `execute` | `execute` |
| MapReduceScript | `getInputData`, `map`, `reduce`, `summarize` | `getInputData`, returning `[]` |
| MassUpdateScript | `each` | `each` |
| Portlet | `render` | `render` |
| WorkflowActionScript | `onAction` | `onAction` |
| BundleInstallationScript | `beforeInstall`, `beforeUpdate`, `afterInstall`, `afterUpdate` | `afterInstall` |
| SDFInstallationScript | `run` | `run` |

## Validation Checklist For Converted 2.x Scripts

- [ ] `@NApiVersion` is `2.1`.
- [ ] No conditional `catch (e if ...)` syntax remains.
- [ ] No Rhino `for each` loops remain.
- [ ] Reserved words are not used as identifiers.
- [ ] One-argument `parseInt` calls are converted to helper calls; explicit-radix and zero-argument calls may remain.
- [ ] `JSON.parse` compatibility decisions are reviewed.
- [ ] A relative dependency ending in `SSConverterHelper` exists when helper calls exist.
- [ ] Helper file is deployed when helper dependency exists.
- [ ] RESTlet `post` return behavior is reviewed.
- [ ] No SuiteScript API calls execute at define-callback evaluation time unless intentionally deferred through factories.
- [ ] Returned module object has a valid entrypoint for its `@NScriptType`.
- [ ] Injected fallback entrypoints are implemented or explicitly accepted as no-ops.
- [ ] Non-`N/*` define dependencies do not include `.js` suffixes.
- [ ] Plugin deployment blockers such as `platformextensionplugin` are reported, not automatically rewritten.
- [ ] Generated SS1.0-looking string content is reported as generated legacy content, not rewritten as executable source.
- [ ] Conversion report includes source/target version, conversion path, original preservation behavior, transformations applied, helper status, manual-review items, and deployment notes.

## Babel Source Map

| Skill topic | Babel source |
|---|---|
| Pipeline order | `src/transformer/transformer.ts` |
| Rule names | `src/transformer/transformation-names.ts` |
| Conditional catch, `for each`, reserved identifiers | `src/transformer/transformations/pre-transform-overrides.ts` |
| Version tag | `src/transformer/transformations/transform-n-api-version-tag-to-2-1.ts` |
| Const reassignment | `src/transformer/transformations/transform-const-with-try-catch.ts` |
| JSON parsing | `src/transformer/transformations/transform-json-parsing.ts` |
| Error properties | `src/transformer/transformations/transform-error-properties-to-enumerable.ts` |
| Date formatting | `src/transformer/transformations/transform-keep-long-date-format.ts` |
| parseInt | `src/transformer/transformations/transform-keep-parse-int-trailing-zeros-behavior.ts` |
| RESTlet POST returns | `src/transformer/transformations/transform-restlet-post-strings.ts` |
| API enum factories | `src/transformer/transformations/transform-api-enum-declarations-to-factories.ts` |
| API-backed top-level factories | `src/transformer/transformations/transform-api-backed-top-level-declarations-to-factories.ts` |
| Returned module properties | `src/transformer/transformations/transform-non-evaluable-properties-in-module-object.ts`, `src/transformer/transformations/transform-evaluable-properties-to-getters-in-script-types.ts` |
| Missing entrypoints | `src/transformer/transformations/transform-missing-script-type-entrypoints-to-no-op.ts` |
| Dependency cleanup | `src/transformer/transformations/transform-remove-js-extension-from-define-dependencies.ts` |
| Helper module | `src/transformer/suitescript-converter-helper-module/*` |
| File preservation and deploy XML helper coverage | `src/converter/converter.ts` |
| Report labels and review highlighting | `src/cli-tool/actions/scrape-and-convert-suite-cloud-project.ts` |
