# AI Agent Plug-ins guidance

## Sources and generated output

Read `README.md`, `DEVELOPMENT.md`, `DISTRIBUTION.md`, `config/build.json`, and the affected `plugin.build.json` recipes before changing packaging.

- Reusable development and business skills come from `../agent-skills/` by default; follow that package's guidance when editing them.
- SuiteSkills business skills and runbooks live in `common/skills/suiteskills/`, selected through `skillSources.suiteskills`.
- Canonical shared SuiteSkills guidance lives in `common/layers/suiteskills/`; keep the isolated shared copies in each SuiteSkills skill synchronized.
- Provider recipes and local inputs live in `anthropic/<plugin-id>/` and `openai/<plugin-id>/`.
- `../../dist/ai-plugins/` is generated. Edit sources and rebuild with repository scripts.

Use provider-qualified keys such as `openai/netsuite-suiteskills` with `build:one`; duplicate IDs cannot select a provider. Preserve intentional provider differences: native manifests, OpenAI `agents/openai.yaml` files and branding, provider metadata, and installation layouts. Do not assume identical packaged file sets.

## Integrity and evidence

For every packaged edit, including a packaged README, inspect and update affected integrity records. When foundation inputs change, inspect resource maps, provider `src/FOUNDATION-SNAPSHOT.json` files, canonical shared files and isolated copies, the onboarding `FOUNDATION-LOCK.json`, and both provider `src/INVENTORY.json` files. Refresh current-content hashes as needed while preserving historical source provenance, component versions, and existing formatting. Inventories exclude themselves, generated native manifests, and builder-supplied `LICENSE.txt`.

The onboarding hash chain is `common/skills/suiteskills/netsuite-suiteskills-onboarding/PLUGIN-CONTEXT.md` → `FOUNDATION-LOCK.json`'s `utility_context_sha256` → both providers' inventories, which record the packaged context and lock. A context edit requires checking the entire chain.

Keep claims about packaged content, tools available in a session, account features and role permissions, and actual execution evidence distinct. Package validation does not establish installed-host loading, model behavior, live-account execution, or export/delivery support. Qualify those separately using evidence from the target host; preserve recorded `not_run` statuses until execution is demonstrated.

## Documentation

Follow the shared [README documentation policy](../../AGENTS.md#readme-documentation). Keep user-facing READMEs focused on users, contributor procedures in `DEVELOPMENT.md` or dedicated contributor documents, and agent instructions in `AGENTS.md`. Preserve package-specific legal text and links that resolve in the installed distribution.

## Checks and releases

Before every commit affecting this package or consumed skill sources, complete the mandatory checklist in `DEVELOPMENT.md`. It applies to documentation, metadata, and integrity-record changes as well as code. A successful build alone is insufficient. Report missing prerequisites and failing checks; do not describe the change as ready to commit until every required check passes.

Follow `DISTRIBUTION.md` for versions and releases. Changed published plug-ins normally require increased stable `MAJOR.MINOR.PATCH` versions in their recipes; lower versions, prerelease versions, and build metadata are unsupported. Same-version reissues follow the documented exceptional procedure and require the existing release tag to be removed before dispatch. Do not change versions or release tags without the requested release scope.

The DIST workflow publishes the complete generated distribution, including its root README, to `ai-plugins-dist`. Changed-plug-in metadata controls tags; it does not limit the copied distribution. Verify the actual comparison against the distribution branch before claiming only certain packages will change. Commit, push, tag, publish, or dispatch release workflows only when requested.
