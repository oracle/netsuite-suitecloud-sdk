# Reusable agent skills guidance

Read `README.md`, `package.json`, and `scripts/lib/skill-validator.mjs` before authoring. Keep instructions agent agnostic: describe capabilities, paths, and standard commands; scope intentional provider requirements explicitly. Keep entry instructions concise, state prerequisites and tool/account requirements, and put supporting detail in local references for reproducibility.

Each skill has its own directory with `SKILL.md`, plus optional `references/`, `scripts/`, and `assets/`. Use a unique lowercase `netsuite-` name with single hyphens, matching the directory. Frontmatter must be valid YAML with a name and description, followed by a nonempty Markdown body. Preserve licensing and attribution; describe actual runtime compatibility and prerequisites accurately.

The validator is authoritative for naming and frontmatter constraints, including length limits, optional compatibility strings, and string-valued metadata. Resolve discrepancies with prose examples using `scripts/lib/skill-validator.mjs`; do not weaken validation to accommodate an edit.

These skills are consumed by provider plug-ins in `../ai-plugins/`. SuiteSkills business skills and runbooks have separate sources in `../ai-plugins/common/skills/suiteskills/`; edit the owning source rather than a generated copy.

From the repository root, validate and test changes here:

```sh
npm ci --workspace @oracle/agent-skills
npm run validate --workspace @oracle/agent-skills
npm run test --workspace @oracle/agent-skills
```

When changing skill sources consumed by AI plug-ins, also follow `../ai-plugins/AGENTS.md` and complete the mandatory pre-commit checklist in `../ai-plugins/DEVELOPMENT.md`, including the complete plug-in build and release verification. Report failures and missing prerequisites accurately; a successful build alone is insufficient.

## Documentation

Follow the shared [README documentation policy](../../AGENTS.md#readme-documentation). Keep user-facing READMEs focused on users, contributor procedures in `DEVELOPMENT.md` or dedicated contributor documents, and agent instructions in `AGENTS.md`. Preserve package-specific legal text and check links at the document's published destination.
