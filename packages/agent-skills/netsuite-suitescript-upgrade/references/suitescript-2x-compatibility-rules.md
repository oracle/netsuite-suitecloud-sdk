# SuiteScript 2.0/2.x to 2.1 Compatibility Rules
> Author: Oracle NetSuite

This reference documents SuiteScript 2.0/2.x to 2.1 compatibility rules based on Oracle NetSuite's [Differences Between SuiteScript 2.0 and SuiteScript 2.1](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_158755248128.html) documentation.

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

## Rule Definitions and Examples

### Pipeline order

Defines: apply SuiteScript 2.x compatibility rules in a fixed dependency-safe order so legacy syntax is normalized before version, runtime, API-evaluation, script-type, and dependency-cleanup rules.

Order:
1. Legacy syntax compatibility: conditional catch, Rhino `for each`, and reserved identifiers.
2. Version tag normalization.
3. Runtime behavior preservation: const reassignment, `JSON.parse`, Error properties, long date formatting, one-argument `parseInt`, and RESTlet `post` return values.
4. SuiteScript API evaluation safety: API enum factories, API-backed top-level factories, returned module property factories, and returned script-type property getters.
5. Script-type validation: missing entrypoint fallback injection.
6. Dependency cleanup: remove `.js` suffixes from non-`N/*` `define([...])` dependencies.

Helper: No direct helper requirement. Individual runtime rules may require `SSConverterHelper`.

Review: Low for order documentation; review individual rules by their own severity.

Example source: implementation behavior.

### Rule names

Defines: conversion reports use stable rule labels so reviewers can identify which compatibility behaviors changed a file.

Report labels:
1. `CONDITIONAL_TRY_CATCH`: conditional catch rewrite.
2. `FOR_EACH_IN`: Rhino `for each` rewrite.
3. `RESERVED_WORDS_AS_IDENTIFIERS`: reserved identifier rename.
4. `CONST_WITH_TRY_CATCH`: const reassignment preservation.
5. `JSON_PARSING`: legacy `JSON.parse` compatibility rewrite.
6. `LONG_DATE_FORMAT`: long local date formatting rewrite.
7. `PARSE_INT_TRAILING_ZEROS`: one-argument `parseInt` compatibility rewrite.
8. `N_API_VERSION`: `@NApiVersion` normalization.
9. `ERROR_ENUMERABLE_PROPERTIES`: native Error enumerable property rewrite.
10. `STRINGIFY_RESTLET_POST`: RESTlet `post` return stringification.
11. `API_ENUM_DECLARATIONS_TO_FACTORIES`: API enum object factory rewrite.
12. `API_BACKED_TOP_LEVEL_DECLARATIONS_TO_FACTORIES`: API-backed top-level factory rewrite.
13. `NON_EVALUABLE_PROPERTIES_IN_MODULE`: returned module property factory rewrite.
14. `EVALUABLE_PROPERTIES_TO_GETTERS`: returned script-type property getter rewrite.
15. `MISSING_SCRIPT_TYPE_ENTRYPOINTS_TO_NO_OP`: missing entrypoint fallback injection.
16. `REMOVE_JS_EXTENSION_FROM_DEFINE_DEPENDENCIES`: non-`N/*` `.js` dependency suffix cleanup.

Helper: only `JSON_PARSING` and `PARSE_INT_TRAILING_ZEROS` require `SSConverterHelper`.

Review: Low for label reporting; review each rule by its own severity.

Example source: implementation behavior.

### Conditional catch

Defines: replace SuiteScript 2.0 conditional catch syntax with standard JavaScript catch syntax while preserving the condition-based handling behavior.

Detects: `catch (e if condition)` after a `try` block.

Converts: a conditional catch into a standard `catch (e)` whose body checks the original condition. If the condition is false, the error is rethrown. Multiple conditional catches become one `catch` with an `if` / `else if` chain and a final rethrow.

Helper: No.

Review: Medium. Verify the condition still has access to the variables it needs and that rethrown errors are acceptable for unmatched conditions.

Before:
```javascript
define([], () => {
    var doSomething, log;
    try {
        doSomething();
    } catch (e if e instanceof TypeError) {
        log.debug("error =", e);
    }
});
```

After:
```javascript
define([], () => {
    var doSomething, log;
    try {
        doSomething();
    } catch (e) {
        if (e instanceof TypeError) {
            log.debug("error =", e);
        } else {
            throw e;
        }
    }
});
```

Multiple conditional catches before:
```javascript
try {
    doSomething();
} catch (e if e instanceof TypeError) {
    log.debug(e);
} catch (e if e instanceof ReferenceError) {
    log.debug(e);
}
```

Multiple conditional catches after:
```javascript
try {
    doSomething();
} catch (e) {
    if (e instanceof TypeError) {
        log.debug(e);
    } else if (e instanceof ReferenceError) {
        log.debug(e);
    } else {
        throw e;
    }
}
```

Example source: unit test.

### Rhino `for each`

Defines: replace Rhino `for each (... in ...)` loops with standard key iteration while preserving value iteration behavior.

Detects: `for each(var value in source)` or `for each(let value in source)`.

Converts: a `for each` loop into a `for (let _key in source)` loop, then assigns the current value from `source[_key]` before running the original loop body. Nested loops use distinct generated key names. When the source is an expression such as a function call, store it in a temporary variable first so it is evaluated once.

Helper: No.

Review: Medium. Verify object and array iteration behavior, especially when the source expression has side effects or inherited enumerable properties.

Before:
```javascript
define([], () => {
    var log;
    var obj = [1, 2, 3];
    for each(var value in obj) {
        log.debug("value: ", value);
    }
});
```

After:
```javascript
define([], () => {
    var log;
    var obj = [1, 2, 3];
    for (let _key in obj) {
        var value = obj[_key];
        log.debug("value: ", value);
    }
});
```

Expression source before:
```javascript
for each(var value in getObj()) {
    log.debug("value: ", value);
}
```

Expression source after:
```javascript
var _obj = getObj();
for (let _key in _obj) {
    var value = _obj[_key];
    log.debug("value: ", value);
}
```

Example source: unit test.

### Reserved identifiers

Defines: rename reserved words used as JavaScript identifiers so SuiteScript 2.0-era source can parse under SuiteScript 2.1 while preserving static references to the same value.

Detects: whole identifiers that are reserved words, such as function parameters, variable names, and references to those bindings. Identifiers that merely start with reserved-word text, such as `extends1`, are preserved.

Converts: each reserved identifier to a generated name in the form `__ss2_reserved_<word>`. Object literal property names, dot-property names, and string property keys are preserved because they are property names, not identifier bindings.

Helper: No.

Review: Medium. Verify any dynamic string-based access still targets the intended property names, since property names are intentionally not renamed.

Before:
```javascript
define([], () => {
    function addOne(extends) {
        return extends + 1;
    }

    var extends = addOne(1);
    var data = { extends: "ok" };

    return {
        value: extends,
        dot: data.extends,
        bracket: data["extends"]
    };
});
```

After:
```javascript
define([], () => {
    function addOne(__ss2_reserved_extends) {
        return __ss2_reserved_extends + 1;
    }

    var __ss2_reserved_extends = addOne(1);
    var data = { extends: "ok" };

    return {
        value: __ss2_reserved_extends,
        dot: data.extends,
        bracket: data["extends"]
    };
});
```

Multi-declarator before:
```javascript
define([], () => {
    var extends = 0, break = 1, async = 2;
    return extends + break + async;
});
```

Multi-declarator after:
```javascript
define([], () => {
    var __ss2_reserved_extends = 0, __ss2_reserved_break = 1, async = 2;
    return __ss2_reserved_extends + __ss2_reserved_break + async;
});
```

Example source: unit test.

### Version tag

Defines: normalize existing SuiteScript 2.0 and 2.x AMD modules to the SuiteScript 2.1 target version.

Detects: `@NApiVersion 2.0`, `@NApiVersion 2.x`, or `@NApiVersion 2.X` in a file that contains a `define()` call. Extra whitespace around the tag is allowed. The rule also applies to SuiteScript files declared as `@NScriptType PlugInTypeImpl`.

Converts: replace the version annotation with `@NApiVersion 2.1`.

Helper: No.

Review: Low. If a file has no `define()` call, do not use this rule alone as proof that the file is a SuiteScript 2.x AMD module.

Before:
```javascript
/**
 *     @NApiVersion              2.x
 * @NScriptType ScheduledScript
 */
var __awaiter = (this && this.__awaiter) || function () {};
define([], () => {});
```

After:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
var __awaiter = (this && this.__awaiter) || function () {};
define([], () => {});
```

Plugin implementation before:
```javascript
/**
 * @NApiVersion 2.X
 * @NScriptType PlugInTypeImpl
 */
define([], () => {});
```

Plugin implementation after:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType PlugInTypeImpl
 */
define([], () => {});
```

Example source: unit test.

### Const reassignment

Defines: preserve SuiteScript 2.0 behavior where attempted reassignment of a `const` binding could be ignored instead of failing the script.

Detects: a direct assignment statement whose left side is an identifier bound by a `const` declaration. Constants that are never reassigned are preserved.

Converts: wrap the reassignment statement in a `try/catch`. The right-hand expression is still evaluated inside the `try`, so side effects from that expression can still occur. If the reassignment throws, the `catch` suppresses the error and the original constant value remains.

Helper: No.

Review: Medium. Verify suppressed reassignment errors are intentional, especially when the right-hand expression has side effects.

Before:
```javascript
define([], () => {
    const thisIsAConstant = "someValue";
    thisIsAConstant = "newValue";
});
```

After:
```javascript
define([], () => {
    const thisIsAConstant = "someValue";
    try {
        thisIsAConstant = "newValue";
    } catch (e) {
        `// SuiteScript 2.0 ignored const reassignment`;
    }
});
```

Side-effect before:
```javascript
const a = "someValue";
let b = 1;
function changeB() {
    b = 2;
}
a = changeB();
```

Side-effect after:
```javascript
const a = "someValue";
let b = 1;
function changeB() {
    b = 2;
}
try {
    a = changeB();
} catch (e) {
    `// SuiteScript 2.0 ignored const reassignment`;
}
```

Example source: unit test.

### JSON parsing

Defines: preserve SuiteScript 2.0 `JSON.parse` tolerance for trailing commas when normalizing code to SuiteScript 2.1.

Detects: any direct `JSON.parse(...)` call.

Converts: replace each call with `ssConverterHelper.jsonParse_legacySS20(...)` and add a relative `define()` dependency ending in `SSConverterHelper`.

Helper: Yes. Deploy `SuiteScriptConverter/SSConverterHelper.js` and ensure `deploy.xml` covers the helper file or containing directory.

Review: Medium. The helper preserves trailing-comma tolerance in otherwise valid JSON only; empty strings, missing quoted property names, single-quoted property names, and malformed empty arrays or objects must still throw syntax errors.

Before:
```javascript
define([], () => {
    function test(param) {}

    JSON.parse("a");
    const value = JSON.parse(jsonString);
    test(JSON.parse(payload));
});
```

After:
```javascript
define(["SuiteScriptConverter/SSConverterHelper"], (ssConverterHelper) => {
    function test(param) {}

    ssConverterHelper.jsonParse_legacySS20("a");
    const value = ssConverterHelper.jsonParse_legacySS20(jsonString);
    test(ssConverterHelper.jsonParse_legacySS20(payload));
});
```

Trailing comma behavior before:
```javascript
const jsonString = '{"arrayKey": [1,2,3,], "objectKey": { "innerProp": 1, }, }';
const result = JSON.parse(jsonString);
```

Trailing comma behavior after:
```javascript
const jsonString = '{"arrayKey": [1,2,3,], "objectKey": { "innerProp": 1, }, }';
const result = ssConverterHelper.jsonParse_legacySS20(jsonString);
```

Example source: unit test.

### Error properties

Defines: preserve SuiteScript 2.0-style JSON serialization of native error constructor arguments by making those values enumerable properties.

Detects: `new Error(...)` and native error constructors such as `RangeError`, `ReferenceError`, `SyntaxError`, `URIError`, and `EvalError` when at least one constructor argument is supplied. Constructor calls without arguments are preserved.

Converts: instantiate the error without arguments, then assign enumerable properties. The first argument becomes `.message`; a non-object second argument becomes `.fileName`; a third argument becomes `.lineNumber`. When option properties are supplied, copy those properties onto the error object.

Helper: No.

Review: Medium. Verify code that depends on constructor argument behavior, JSON serialization, or custom error subclasses.

Before:
```javascript
define([], () => {
    var firstError = new Error("message", "file.js", 10);
    var rangeError = new RangeError("Out of range");
});
```

After:
```javascript
define([], () => {
    var firstError = new Error();
    firstError.message = "message";
    firstError.fileName = "file.js";
    firstError.lineNumber = 10;
    var rangeError = new RangeError();
    rangeError.message = "Out of range";
});
```

No-argument constructor before:
```javascript
define([], () => {
    var firstError = new Error();
    firstError.message = "A message";
});
```

No-argument constructor after:
```javascript
define([], () => {
    var firstError = new Error();
    firstError.message = "A message";
});
```

Example source: unit test.

### Date formatting

Defines: preserve SuiteScript 2.0 long local-date formatting when moving to SuiteScript 2.1.

Detects: `.toLocalDateString(...)` calls on a date expression.

Converts: replace the call with `new Intl.DateTimeFormat(localeOrDefault, { year: "numeric", month: "long", day: "numeric" }).format(dateExpression)`. No-argument calls use `"en-US"`. A string locale argument is preserved. Extra formatting options are ignored.

Helper: No.

Review: Low. Verify any call that intentionally relied on custom formatting options, because this rule forces long month names.

Before:
```javascript
define([], () => {
    const someDate = new Date(Date.UTC(2012, 11, 21, 12));
    const formattedDate = someDate.toLocalDateString();
});
```

After:
```javascript
define([], () => {
    const someDate = new Date(Date.UTC(2012, 11, 21, 12));
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(someDate);
});
```

Locale argument before:
```javascript
const formattedDate = someDate.toLocalDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric"
});
```

Locale argument after:
```javascript
const formattedDate = new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
}).format(someDate);
```

Example source: unit test.

### parseInt

Defines: preserve SuiteScript 2.0 one-argument `parseInt` behavior for zero-prefixed values when normalizing to SuiteScript 2.1.

Detects: `parseInt(value)` with exactly one argument.

Converts: replace the call with `ssConverterHelper.parseInt_legacySS20(value)` and add a relative `define()` dependency ending in `SSConverterHelper`. Calls with an explicit radix and calls with no arguments are preserved.

Helper: Yes. Deploy `SuiteScriptConverter/SSConverterHelper.js` and ensure `deploy.xml` covers the helper file or containing directory.

Review: Medium. Verify zero-prefixed values such as `"08"`, `"002"`, and account-like strings because the helper intentionally preserves legacy parsing behavior instead of forcing base-10 parsing for every value.

Before:
```javascript
define([], () => {
    const replace = parseInt("08");
    const keep = parseInt("08", 10);
    const alsoKeep = parseInt();
});
```

After:
```javascript
define(["SuiteScriptConverter/SSConverterHelper"], (ssConverterHelper) => {
    const replace = ssConverterHelper.parseInt_legacySS20("08");
    const keep = parseInt("08", 10);
    const alsoKeep = parseInt();
});
```

Legacy behavior before:
```javascript
const oneZero = parseInt("08");
const manyZeros = parseInt("0003");
const explicitRadix = parseInt("0003", 10);
```

Legacy behavior after:
```javascript
const oneZero = ssConverterHelper.parseInt_legacySS20("08");
const manyZeros = ssConverterHelper.parseInt_legacySS20("0003");
const explicitRadix = parseInt("0003", 10);
```

Example source: unit test.

### RESTlet POST returns

Defines: preserve SuiteScript 2.0 RESTlet `post` response behavior by returning a stringified value after conversion to SuiteScript 2.1.

Detects: files declared as `@NScriptType Restlet` with direct `return expression;` statements inside a `post` function declaration or `post` object method.

Converts: wrap each direct return expression in `JSON.stringify(...)`. This wrapping is applied even when the expression is already a `JSON.stringify(...)` call.

Helper: No.

Review: Medium. Verify RESTlet consumers expect the converted response shape, especially when existing code already stringifies the returned value.

Before:
```javascript
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define([], () => {
    function post() {
        return "flower";
    }
});
```

After:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([], () => {
    function post() {
        return JSON.stringify("flower");
    }
});
```

Already-stringified before:
```javascript
function post() {
    return JSON.stringify("flower");
}
```

Already-stringified after:
```javascript
function post() {
    return JSON.stringify(JSON.stringify("flower"));
}
```

Example source: unit test.

### API enum factories

Defines: defer SuiteScript API enum access that would otherwise happen while the `define()` callback is evaluated.

Detects: a variable inside a `define()` factory initialized to an object literal whose non-computed properties are all enum-style member chains from the same `define()` dependency, such as `someApi.Type.A` and `someApi.Type.B`.

Converts: replace the object value with a zero-argument factory that returns the object. Member reads from that object are rewritten from `TYPES.A` to `TYPES().A`. Returning the enum object by name now returns the factory.

Helper: No.

Review: High. Verify consumers expect a callable factory when the enum map is returned or shared outside the module.

Before:
```javascript
define(["N/someApi"], (someApi) => {
    const TYPES = {
        A: someApi.Type.A,
        B: someApi.Type.B
    };

    return {
        TYPES,
        read: function () {
            return TYPES.A;
        }
    };
});
```

After:
```javascript
define(["N/someApi"], (someApi) => {
    const TYPES = () => {
        return {
            A: someApi.Type.A,
            B: someApi.Type.B
        };
    };

    return {
        TYPES,
        read: function () {
            return TYPES().A;
        }
    };
});
```

Not converted:
```javascript
define(["N/someApi"], (someApi) => {
    const state = {
        A: someApi.getA(),
        B: "literal"
    };

    return { state };
});
```

Example source: unit test.

### API-backed top-level factories

Defines: defer stable top-level values that call or read SuiteScript API dependencies during `define()` callback evaluation.

Detects: top-level `const`, `let`, or `var` declarations inside a `define()` factory whose initializer depends on a `define()` dependency binding, such as `url.resolveScript(...)`. Function expressions, arrow functions, arrays, object literals, and declarations that are reassigned after initialization are preserved.

Converts: replace the initializer with a zero-argument factory and rewrite reads from `VALUE` to `VALUE()`. Shorthand object properties are expanded so the property name is preserved while the value becomes a factory call.

Helper: No.

Review: High. Verify exported values, shared constants, and any call sites outside the converted module that may now receive a function instead of an immediate value.

Before:
```javascript
define(["N/url"], (url) => {
    const EMB_URL = url.resolveScript({
        scriptId: "customscript_ext",
        deploymentId: "customdeploy_ext"
    });

    function onRequest(context) {
        context.response.write(EMB_URL);
    }

    return { onRequest };
});
```

After:
```javascript
define(["N/url"], (url) => {
    const EMB_URL = () => url.resolveScript({
        scriptId: "customscript_ext",
        deploymentId: "customdeploy_ext"
    });

    function onRequest(context) {
        context.response.write(EMB_URL());
    }

    return { onRequest };
});
```

Shorthand read before:
```javascript
function read() {
    return { EMB_URL };
}
```

Shorthand read after:
```javascript
function read() {
    return {
        EMB_URL: EMB_URL()
    };
}
```

Not converted:
```javascript
define(["N/url"], (url) => {
    let EMB_URL = url.resolveScript({
        scriptId: "customscript_ext",
        deploymentId: "customdeploy_ext"
    });
    EMB_URL = EMB_URL + "&changed=1";

    function get() {
        return EMB_URL;
    }

    return { get };
});
```

Example source: unit test.

### Returned module properties

Defines: defer returned non-function properties that depend on SuiteScript API bindings in script modules and scoped library modules.

Detects: modules with `@NScriptType` or `@NModuleScope` whose returned module object contains a non-function property value that depends on a `define()` dependency binding. This includes an inline returned object and a predeclared object returned by name. Function properties, arrow-function properties, static literals, and modules without one of those tags are preserved.

Converts: replace each API-backed non-function property value with a zero-argument factory. Inside functions on the same returned object, rewrite `this.prop` reads to `this.prop()` when `prop` was converted to a factory.

Helper: No.

Review: High. Verify callers and returned-object methods expect the converted property to be callable, especially for shared library modules that are imported by other scripts.

Inline return before:
```javascript
/**
 * @NScriptType Suitelet
 */
define(["N/log"], (log) => {
    return {
        toConvert: log,
        onRequest: function (context) {}
    };
});
```

Inline return after:
```javascript
/**
 * @NScriptType Suitelet
 */
define(["N/log"], (log) => {
    return {
        toConvert: () => log,
        onRequest: function (context) {}
    };
});
```

Returned object before:
```javascript
/**
 * @NModuleScope Public
 */
define(["N/log"], (log) => {
    const returnObject = {
        toConvert: log,
        read: function () {
            return this.toConvert;
        }
    };

    return returnObject;
});
```

Returned object after:
```javascript
/**
 * @NModuleScope Public
 */
define(["N/log"], (log) => {
    const returnObject = {
        toConvert: () => log,
        read: function () {
            return this.toConvert();
        }
    };

    return returnObject;
});
```

Not converted:
```javascript
/**
 * @NScriptType Suitelet
 */
define(["N/log"], (log) => {
    return {
        toKeep: "static value",
        onRequest: function (context) {}
    };
});
```

Example source: unit test.

### Missing entrypoints

Defines: keep converted files deployable when a known script type returns no supported entrypoint.

Detects: a file with a known `@NScriptType` whose returned module object does not include any valid entrypoint for that script type. Unknown script types are preserved. Files that already return a valid entrypoint are preserved.

Converts: inject the fallback entrypoint listed in the fallback table above, add it to the returned module object, and include a TODO comment requiring review. Map/Reduce fallback `getInputData` returns an empty array. Other fallback entrypoints are no-op functions unless the fallback table specifies a return value.

Helper: No.

Review: High. Implement the injected entrypoint or explicitly accept it as a no-op before deployment; fallback injection only satisfies entrypoint validation.

ClientScript before:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/url"], function (url) {
    function generateTransactionResp() {
        return url;
    }

    return {
        generateTransactionResp: generateTransactionResp
    };
});
```

ClientScript after:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/url"], function (url) {
    function pageInit() {
        // TODO: Implement this entrypoint or review why it was missing before conversion.
        ;
    }
    function generateTransactionResp() {
        return url;
    }

    return {
        generateTransactionResp: generateTransactionResp,
        pageInit: pageInit
    };
});
```

Map/Reduce before:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([], function () {
    return {
        helper: function () {}
    };
});
```

Map/Reduce after:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([], function () {
    function getInputData() {
        // TODO: Implement this entrypoint or review why it was missing before conversion.
        ;
        return [];
    }
    return {
        helper: function () {},
        getInputData: getInputData
    };
});
```

Example source: unit test.

### Dependency cleanup

Defines: normalize custom `define([...])` dependency strings for SuiteScript 2.1 module loading.

Detects: string literal dependencies in a `define([...])` dependency array where the dependency does not start with `N/` and ends with `.js`.

Converts: remove the final `.js` suffix from each matching dependency. `N/*` dependency strings are preserved even if they end in `.js`. `require([...])` arrays and arbitrary arrays are not changed.

Helper: No.

Review: Low. Verify custom module paths still resolve relative to the converted file.

Before:
```javascript
define(["./a.js", "../b.js", "N/log", "lodash.js", "./already"], (a, b, log, lodash, already) => {
    return { a, b, log, lodash, already };
});
```

After:
```javascript
define(["./a", "../b", "N/log", "lodash", "./already"], (a, b, log, lodash, already) => {
    return { a, b, log, lodash, already };
});
```

Preserved `N/*` and `require` examples:
```javascript
define(["N/search.js", "SuiteScripts/module.js"], (search, module) => {
    return { search, module };
});

require(["./something.js"], function (something) {
    return something;
});
```

After:
```javascript
define(["N/search.js", "SuiteScripts/module"], (search, module) => {
    return { search, module };
});

require(["./something.js"], function (something) {
    return something;
});
```

Example source: unit test.

### Helper module

Defines: add the shared compatibility helper only when a converted file uses helper-backed runtime behavior.

Detects: helper-backed rewrites from `JSON.parse(...)` or one-argument `parseInt(value)`.

Converts: add a relative `define()` dependency whose path ends in `SuiteScriptConverter/SSConverterHelper`, add the factory parameter `ssConverterHelper`, and replace the original calls with `ssConverterHelper.jsonParse_legacySS20(...)` or `ssConverterHelper.parseInt_legacySS20(...)`. Do not inject a duplicate helper dependency when one is already present.

Helper: This is the helper rule. It creates a dependency on `SuiteScriptConverter/SSConverterHelper.js`, which exports `jsonParse_legacySS20` and `parseInt_legacySS20`.

Review: Medium. Verify the dependency path is correct from the converted script's folder and that the helper file is deployed.

Before:
```javascript
define(["N/log"], (log) => {
    const parsed = JSON.parse(payload);
    const amount = parseInt(value);

    return { parsed, amount };
});
```

After:
```javascript
define(["SuiteScriptConverter/SSConverterHelper", "N/log"], (ssConverterHelper, log) => {
    const parsed = ssConverterHelper.jsonParse_legacySS20(payload);
    const amount = ssConverterHelper.parseInt_legacySS20(value);

    return { parsed, amount };
});
```

Helper module shape:
```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope TargetAccount
 */
define([], function () {
    return {
        jsonParse_legacySS20,
        parseInt_legacySS20
    };
});
```

Example source: unit test.

### File preservation and helper deployment coverage

Defines: describe how converted files and helper deployment coverage are written during project conversion.

Detects: the set of transformations applied to each converted file and whether the converted code references `SSConverterHelper`.

Converts:
1. Overwrite the original script in place.
2. If any converted script references `SSConverterHelper`, create `SuiteScriptConverter/SSConverterHelper.js` in the relevant File Cabinet or SuiteApp folder.
3. If a `deploy.xml` file exists and its current paths do not already cover the helper directory, add a path for the helper directory.

Helper: Required only when converted code references `SSConverterHelper` or helper-backed transformations were applied.

Review: Medium. Verify helper paths are included in the deployment scope exactly once.

Deployment path before:
```xml
<deploy>
    <files>
        <path>~/FileCabinet/SuiteScripts/*</path>
    </files>
</deploy>
```

Deployment path after when a SuiteApp helper is needed:
```xml
<deploy>
    <files>
        <path>~/FileCabinet/SuiteApps/com.example.bundle/SuiteScriptConverter/*</path>
        <path>~/FileCabinet/SuiteScripts/*</path>
    </files>
</deploy>
```

Already covered deployment path:
```xml
<path>~/FileCabinet/SuiteApps/com.example.bundle/*</path>
```

Example source: unit test.

### Report labels and review highlighting

Defines: report converted files with stable rule labels, original-file preservation status, and explicit manual-review highlighting for injected fallback entrypoints.

Detects: transformation labels recorded for each converted file and whether `MISSING_SCRIPT_TYPE_ENTRYPOINTS_TO_NO_OP` was applied.

Converts: show version-only files separately from files that received non-version transformations. For transformed files, list the applied rule labels and the preserved original filename. In generated reports, mark rows requiring review when a fallback entrypoint was injected.

Helper: No direct helper requirement. Helper-backed rules are still listed by their own labels.

Review: High when `MISSING_SCRIPT_TYPE_ENTRYPOINTS_TO_NO_OP` appears. Other labels use the review level documented by their rule sections.

Summary output example:
```text
The following scripts were only updated to 2.1 by changing the @NApiVersion tag:
 - customscript_version_only.js

Script customscript_client.js was processed and the following transformations were applied:
 - Inject fallback script-type entrypoint when missing (Please review).
 - SsConverterHelper added to keep behavior of JSON.parse usages
```

Report row fields:
```text
Script Name
Script Path
Rules Applied
TODO checks
```

Rows are visually marked for review when fallback entrypoint injection was applied.

Example source: converter behavior.
