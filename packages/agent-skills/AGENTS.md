# Reusable agent skills guidance

Read `README.md` and the relevant skill sources before authoring. Keep instructions agent agnostic: describe capabilities, paths, and standard commands; scope intentional provider requirements explicitly. Keep entry instructions concise, state prerequisites and tool/account requirements, and put supporting detail in local references for reproducibility.

Each skill has its own directory with `SKILL.md`, plus optional `references/`, `scripts/`, and `assets/`. Use a unique lowercase `netsuite-` name with single hyphens, matching the directory. Frontmatter must be valid YAML with a name and description, followed by a nonempty Markdown body. Preserve licensing and attribution; describe actual runtime compatibility and prerequisites accurately.

This branch does not define an npm workspace, validator, or test suite for this directory. Verify changed frontmatter, local reference links, examples, and consistency with the referenced implementation. Report manual checks and any validation gaps accurately.

## Documentation

Follow the shared [README documentation policy](../../AGENTS.md#readme-documentation). Keep user-facing READMEs focused on users, contributor procedures in `DEVELOPMENT.md` or dedicated contributor documents, and agent instructions in `AGENTS.md`. Preserve package-specific legal text and check links at the document's published destination.
