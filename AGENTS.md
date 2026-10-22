# Repository guidance

## Find the owning package

- `packages/sdk-core/`: shared SuiteCloud SDK implementation.
- `packages/node-cli/`, `packages/vscode-extension/`: command-line and editor integrations.
- `packages/unit-testing/`, `packages/uif-types/`: testing support and UIF types.
- `packages/agent-skills/`: reusable NetSuite agent skills.
- `packages/ai-plugins/`: provider plug-in sources, SuiteSkills business sources, and distribution tooling.

Before editing, consult applicable package `AGENTS.md` files, READMEs, package scripts, and `.github/workflows/`. Use the owning package's commands. Root `npm run build` builds SDK core; it does not validate the whole repository. AI plug-in changes must follow `packages/ai-plugins/DEVELOPMENT.md`'s mandatory pre-commit checklist, including documentation and metadata changes.

## README documentation

Keep user-facing READMEs focused on product descriptions, prerequisites, installation, usage, and links to user documentation. Put repository build, test, authoring, packaging, and release procedures in `DEVELOPMENT.md` or dedicated contributor documents. Put agent instructions in `AGENTS.md`.

Every user-facing README must include the established `Contributing` paragraph linking to the repository contribution guide:

> This project welcomes contributions from the community. Before submitting a pull request, review our [contribution guide](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/CONTRIBUTING.md).

Include a `License` section identifying Oracle copyright and the Universal Permissive License (UPL), Version 1.0. Preserve the applicable package's existing legal wording, copyright years, and additional license terms. Ensure links resolve at the document's published destination.

Apply this policy when creating or editing a user-facing README; do not revise other existing READMEs solely to enforce it.

## Authoring and changes

Keep repository-authored agent instructions agent agnostic, including `AGENTS.md`, `SKILL.md`, and runbooks. Describe required capabilities, repository paths, and standard commands without assuming a particular coding agent. Keep intentional provider-specific requirements explicit and narrowly scoped.

Preserve unrelated work, existing file formatting, and licensing. Edit source files and regenerate artifacts through repository scripts; do not patch generated distributions by hand. Keep changes within the requested scope.

Report checks accurately: state what ran, what passed, what failed, and any missing prerequisites or checks not run. Distinguish existing failures from regressions introduced by the change; do not claim readiness when required checks fail or cannot run.

Commit, push, tag, publish, or trigger release workflows only when requested.
