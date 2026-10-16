# Shared AI Agent Plug-ins Sources

Add reusable payloads to a `<layer-name>/` subdirectory in this directory. Each layer is copied after the plug-in-specific `src/` content and before the `LICENSE.txt` and `skills/` directory are generated.

`agent-skills/` is the named `plugin-only` skill source for both SuiteSkills distributions. `agent-skills-openai/` is an unused reference retained for later removal, not a common layer or fallback source.

Existing plugins omit `skillSource` and continue to use `buildConfig.skillsRoot`. A plugin selecting a named source resolves all its skills exclusively there; unknown sources and missing skills fail validation. Each plugin retains its validated skill directories, so identical names in different sources cannot substitute for one another. Source roots must stay inside this package and pass directory, containment and symlink checks. All selected files still pass strict destination collision checks.

Provider resources belong to explicit plugin inputs. OpenAI SuiteSkills includes only the five declared `src/skills/<unsuffixed-name>/agents/openai.yaml` files; Anthropic includes none. Manifests are generated from `plugin.build.json` in `.codex-plugin/` or `.claude-plugin/`; OpenAI has no source root `plugin.json`. Root and category `shared/` resources remain packaged with explicit payload inventories. Current inventory hashes exclude INVENTORY.json itself, the builder-supplied LICENSE.txt and the generated native manifest; historical provenance digests remain unchanged.

Run agent-skills validation and tests, then plugin validation and tests, then build and release verification as separate commands. Packaging checks do not establish native-host or runtime security qualification.
