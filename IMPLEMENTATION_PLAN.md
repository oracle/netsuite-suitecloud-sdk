# Implementation plan: SDFv2 control files in the Node CLI

## Task description

[PDPDEVTOOL-6590](https://corpjira.netsuitecorp.com/browse/PDPDEVTOOL-6590) Add SDFv2 support to the sdk-core/node-cli’s validate, deploy, and package workflows. 

Specifically, the goal is for the CLI to recognize JSON and YAML as acceptable format for "manifest" and "deploy" control files (`.json`, `.yml` and `.yaml`).  
It should also maintain support for legacy SDFv1 flows. Aside of the different file format representations, SDFv2 validate, deploy, and package workflows ought to remain the same as SDFv1 (no change in behaviour).

The ticket's acceptance criteria require the CLI to:

- The CLI recognizes an SDF v2 project when it finds a valid YAML (.yaml or .yml) or JSON manifest and deploy control-file pair.
- A manifest and deploy file may use different V2 formats; for example, manifest.yaml with deploy.json.
- The CLI reads the framework version from the manifest and requires it to be present.
- The CLI rejects a project when the manifest framework version does not match the control-file generation:
  - XML control files with framework version 2.0.
  - YAML or JSON control files with framework version 1.0.
- A valid XML manifest and XML deploy file continue to be treated as an SDF v1 project, preserving existing validate and deploy behavior.
- The CLI rejects a project containing an SDF v1 XML control file together with an SDF v2 YAML or JSON control file, such as manifest.yaml with deploy.xml.
- Unrelated XML/JSON/YAML files, including XLIFF files, do not cause a V1/V2 conflict.
- The CLI reports an error if either the manifest or deploy control file is missing, or if no complete control-file pair can be identified.
- The CLI validates YAML and JSON syntax locally before it uploads an archive or contacts NetSuite.
- The CLI validates required manifest and deploy properties using the published schema for the declared framework version.
- The CLI detects and reports duplicate representations of the same logical SDF control file.
- The CLI validates that paths referenced by the deploy control_file exist in the project.
- The CLI validates required path capitalization.
- The CLI rejects a path selected by the deploy control_file when it resolves outside the project root.
- The CLI builds the archive from the physical project files selected by the deploy control_file.
- (Out of Scope/Not doing) The CLI validates required manifest and deploy properties using the published schema for the declared framework version.
  - When multiple independent local validation errors exist, the CLI reports them together instead of stopping at the first error.
  -  Human-readable errors identify the relevant file and property where applicable.
  - When JSON command output is requested, each validation error is returned as a structured object containing, at minimum, an error code, message, file, and property path where applicable.

- Existing validate and deploy commands run local validation first; they start the existing remote validation or deployment workflow only if local validation succeeds. 
- The same V2 control-file discovery, local validation, and packaging behavior applies to the public-package workflow when it uses the shared packaging logic.

The repository currently has several independent XML-only readers in `node-cli` and `sdk-core`. Consolidating discovery, parsing, and metadata extraction into one `sdk-core` service is necessary. 

### Target architecture

`Sdk-core` owns one control-file pipeline:

```text
discover physical files
  → select one SDF generation
  → parse by extension
  → normalize manifest and ordered deploy groups
  → validate control-file rules and selected paths
  → produce diagnostics and an archive plan
```

XML, JSON, and YAML have small format adapters feeding the same project description. There should be no separate project service or archive-selection implementation per format. The Node CLI retains only a compatibility facade for its many synchronous project-info callers.

## Phased Implementation work

### Phase 1 — Consolidate project discovery and metadata

**Goal:** Establish one authoritative answer to “which project is this, and which control files does it use?”

**Changes**

- Add a `sdk-core` project-control service that discovers `manifest`, `deploy`, and optional `application` files with recognized extensions. Reject missing, duplicate, ambiguous, and mixed-generation control files before selecting a parser; allow YAML and JSON to form a V2 pair. Only recognized SDF control filenames participate, so unrelated XML such as XLIFF does not create a conflict.
- Define a normalized project description containing generation, physical filenames, project type and identity, manifest version, and ordered deploy groups. Keep source file and property locations for diagnostics.
- Move manifest parsing and metadata extraction into that service. Provide a synchronous metadata entry point for existing CLI constructors and an async full-preflight entry point; both use the same discovery and parser functions.
- Replace private manifest readers and XML filename checks with calls to the shared service. Preserve existing method signatures where unrelated commands rely on them.

**Impacted or added classes/modules:** New `ProjectControlService` and normalized project types in `sdk-core`; `ProjectManifestService`, `CreateFileExecutor`, `ProjectInfoService`, and `CLIConfigurationService`. Remove their private manifest-parsing logic, while retaining the CLI facade.

**Phase outcome:** All these callers report the same project identity and control-file selection. This phase can be checked independently of archive creation.

### Phase 2 — (OUT OF SCOPE) Restore V1 manifest and deploy content checks

**Goal:** Ensure the new shared reader does not treat a parseable XML pair as necessarily valid.

**Changes**

- Implement focused V1 manifest rules from Java: required fields by project type; allowed and duplicate fields; project type, IDs, name, version and framework version; feature, bundle, application and dependency declaration rules.
- Implement focused V1 deploy rules: required and allowed groups; ACP configuration restrictions and order; SuiteApp-only `run` entries; required script path and deployment fields; path syntax and permitted section roots.
- Reproduce the Java check for **missing required manifest dependencies** using references found in selected local project files. Do not introduce general validation of those files' contents.
- Report independent control-file errors together. Keep Java rules as a reference for behavior, without copying its class hierarchy into TypeScript.

**Impacted or added classes/modules:** New focused manifest and deploy validator modules in `sdk-core`, plus the shared project-control service. `ProjectArchivePlan` will stop treating a successful XML parse as sufficient validation.

**Phase outcome:** A V1 XML pair receives substantive local manifest/deploy validation before it can be packaged. The explicit `1.0` requirement is intentional, per the earlier decision.

### Phase 3 — Add V2 parsing and schema validation

**Goal:** Accept valid V2 control files without translating them into XML.

**Changes**

- Add JSON and YAML parsers to the shared service; support `.yaml` and `.yml`. Preserve the declared order of V2 deploy groups, including repeated groups permitted by the published format.
- (OUT OF SCOPE) Validate `frameworkversion: "2.0"` and the published V2 manifest/deploy schemas.
- Bundle versioned copies of the authoritative schemas with `sdk-core` so local validation works offline. Do not infer schema rules solely from example projects.

**Impacted or added classes/modules:** Shared project-control service and format adapters, V2 schema-validation module, bundled schema resources, and `sdk-core` dependencies.

**Phase outcome:** The shared service returns either one normalized V2 project or grouped file-specific diagnostics. **Dependency:** the repository has no V2 manifest/deploy schemas today; Distribution must provide the published contract. Its [status document](https://confluence.nsgbu.netsuitecorp.com/pages/viewpage.action?pageId=1467488646) describes examples but reports no equivalent schema layer.

Phases 2 and 3 can be developed largely in parallel once Phase 1's normalized model and diagnostic shape are fixed.

### Phase 4 — Validate selections and build the physical archive

**Goal:** Make the validated deploy document the sole source for archive contents.

**Changes**

- Resolve each deploy selection through `ProjectPathResolver`. Check existence, expected file or directory type, exact capitalization, wildcard rules, lexical containment, and containment after symlink resolution.
- Detect duplicate representations of the same logical SDF document among project files and selected paths. Restrict this check to SDF document locations; XLIFF and unrelated XML remain valid.
- Convert the normalized ordered selections into archive entries, including the *actual* manifest/deploy filenames. Retain V1's established selection behavior where valid, and retain SuiteApp installation-script and preference inclusion where applicable.
- Replace silent skips for invalid paths with diagnostics. Make ZIP creation fail if a selected file disappears after validation, rather than producing an incomplete archive.
- Use this same plan for remote validate/deploy and `project:package`.

**Impacted or added classes/modules:** `ProjectPathResolver`, `ProjectArchivePlan`, `ProjectArchive`, `ZipArchive`, and `PackageProjectExecutor`.

**Phase outcome:** Local validation and packaging agree on the selected physical files. This phase can begin against Phase 1's normalized model while Phases 2 and 3 add rules.

### Phase 5 — Wire preflight and structured errors into commands

**Goal:** Invalid projects fail before authorization refresh, archive upload, or a NetSuite request.

**Changes**

- Invoke shared preflight for validate, deploy, preview, and package in the CLI execution path before its current authorization refresh and XML-assuming action constructors. Also enforce it within `sdk-core` archive creation for direct SDK callers.
- Pass the parsed project metadata into command actions and interactive prompts, avoiding another XML-only lookup.
- Add a structured local diagnostic with `code`, `message`, `file`, and `propertyPath` where applicable. Keep readable grouped output; under `--json`, emit diagnostic objects rather than JSON strings embedded in `errorMessages`.
- Preserve the existing remote result and command-output contracts for valid projects.

**Impacted or added classes/modules:** `CommandActionExecutor`, `ValidateAction`, `DeployAction`, their input and output handlers, `ProjectCommandOutputFormatter`, `ActionResult`/`DeployActionResult`, `ProjectCommandExecutor`, and the SDK operation-result types.

**Phase outcome:** The same local error is actionable in normal output and machine-readable in JSON output, with no remote work started.
