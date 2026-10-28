# Repository guidance

## Find the owning package

- `packages/sdk-core/`: shared SuiteCloud SDK implementation.
- `packages/node-cli/`, `packages/vscode-extension/`: command-line and editor integrations.
- `packages/unit-testing/`, `packages/uif-types/`: testing support and UIF types.
- `packages/agent-skills/`: reusable NetSuite agent skills.
- `packages/ai-plugins/`: provider plug-in sources, SuiteSkills business sources, and distribution tooling.

Before editing, consult applicable package `AGENTS.md` files, READMEs, package scripts, and `.github/workflows/`. Use the owning package's commands. Root `npm run build` builds SDK core; it does not validate the whole repository. AI plug-in changes must follow `packages/ai-plugins/DEVELOPMENT.md`'s mandatory pre-commit checklist, including documentation and metadata changes.

## Documentation standards

When creating or updating user-facing documentation or messages, consult applicable Technical Publications guidance, the internal NetSuite Style Guide, and the Word List. These resources require internal access. If they are unavailable, follow the guidance included in this repository and identify any checks that require Technical Publications review. Do not claim compliance with resources you could not access. Do not copy internal guideline content into this public repository without Technical Publications approval for publication.

Avoid unnecessary third-party tool or dependency version numbers in documentation. Include versions when needed for prerequisites, supported compatibility, or reproducible build and validation instructions. Keep them aligned with the package's requirements and CI configuration.

Avoid hardcoding totals of files, skills, or runbooks. Refer to the relevant source or inventory, or derive counts when needed, so documentation does not become outdated when contents change.

## README documentation

Keep user-facing READMEs focused on product descriptions, prerequisites, installation, usage, and links to user documentation. Put repository build, test, authoring, packaging, and release procedures in `DEVELOPMENT.md` or dedicated contributor documents. Put agent instructions in `AGENTS.md`.

Every user-facing README must include the established `Contributing` paragraph linking to the repository contribution guide:

> This project welcomes contributions from the community. Before submitting a pull request, review our [contribution guide](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/CONTRIBUTING.md).

Include a `License` section following the pattern in the [AI plug-ins](packages/ai-plugins/README.md#license), [agent skills](packages/agent-skills/README.md#license), and [Node.js CLI](packages/node-cli/README.md#license) READMEs: make the `License` heading a link to `LICENSE.txt`, followed by the Oracle copyright statement and the Universal Permissive License (UPL), Version 1.0. Preserve the applicable package's copyright years and additional license terms. Include the Oracle Free Use Terms and Conditions installation statement only where applicable, as in the Node.js CLI README. Ensure links resolve at the document's published destination.

Check changed license statements against the repository license and the affected packages' license files, metadata, and published README text. Preserve intentional package-specific terms and attribution; report conflicting statements without rewriting unrelated files.

Apply this policy when creating or editing a user-facing README; do not revise other existing READMEs solely to enforce it.

## Error messages

Apply this guidance to new or changed user-facing CLI, core, and extension messages.
Preserve established wording and contracts elsewhere; do not rewrite unrelated
catalog entries solely for style consistency.

- Lead with the failed operation or invalid item, include the known reason, and
  give a concrete next step when one is available. Short field-validation messages
  can state the constraint and correction directly. Do not invent a cause or
  suggest retrying when the user must first change something.
- Use concise, neutral language and direct instructions such as "Enter", "Select",
  or "Run". Prefer a specific description over "Something went wrong" when details
  are known. Use sentence case and periods for complete sentences; labels and
  buttons need not be sentences. Preserve official product names and exact UI labels.
- Identify the relevant file, option, field, or configuration source. Report the
  environment variable actually selected, rather than assuming its source.
  Use double quotes around embedded filenames, paths, command examples, and option
  names where needed for clarity; preserve their exact spelling. Never include
  credentials, API keys, or tokens in messages or diagnostic details.
- Use the owning package's translation service and catalog, including short
  validation messages. Reuse existing keys and help-link constants. Keep dynamic
  values in placeholders and complete sentences in catalog entries. Keep mappings,
  placeholder order, and test expectations aligned, following surrounding catalog
  ordering. Shared-service messages must make sense to every consumer; put
  editor-specific instructions in the extension.
- Preserve useful underlying details without repeatedly wrapping them in generic
  failure messages. Let the presentation layer add severity prefixes and layout;
  avoid repeated "Error:" prefixes, duplicate notifications, and blank detail lines.
  For multiple validation failures, use one summary followed by distinct actionable
  items through the existing formatter. Keep independent errors visible.

Example catalog templates (adapt the action to the actual supported flow):

| Situation | Message |
| --- | --- |
| Missing prerequisite | `No API key was found. Run "suitecloud proxy:generatekey" and try again.` |
| Invalid option | `Invalid "--type" value "{0}". Enter ACCOUNTCUSTOMIZATION or SUITEAPP.` |
| Known failure with context | `Unable to read "{0}": {1}` |

For the last example, include the reason only when available and safe to display;
do not show an empty suffix or prescribe a fix before the cause is known.

## Authoring and changes

Before adding shared behavior, identifiers, or types, find the existing owner and its consumers. Extend that owner when the semantics match; keep product-specific behavior in its integration package. Apply this to the requested change without expanding it into an unrelated refactor. Review the affected consumers whenever a shared contract changes.

Keep repository-authored agent instructions agent agnostic, including `AGENTS.md`, `SKILL.md`, and runbooks. Describe required capabilities, repository paths, and standard commands without assuming a particular coding agent. Keep intentional provider-specific requirements explicit and narrowly scoped.

Preserve unrelated work, existing file formatting, and licensing. Edit source files and regenerate artifacts through repository scripts; do not patch generated distributions by hand. Keep changes within the requested scope.

## Verification before commits

Before every commit, identify the affected packages and consumers, rebuild affected packages, and run their required local checks corresponding to the applicable CI workflows. Use package-specific instructions and scripts; a root build alone does not validate every package. Apply this requirement to documentation, metadata, and integrity-record changes as well as code. Follow any more specific package checklist, including the AI plug-in checklist in `packages/ai-plugins/DEVELOPMENT.md` when applicable.

Report checks accurately: state what ran, what passed, what failed, and any missing prerequisites or checks not run. Distinguish existing failures from regressions introduced by the change; do not claim readiness to commit when required checks fail or cannot run. Report local verification separately from actual remote pipeline results.

Commit, push, tag, publish, or trigger release workflows only when requested.
