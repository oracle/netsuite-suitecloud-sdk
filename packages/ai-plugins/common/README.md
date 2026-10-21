# Shared AI Agent Plug-ins Sources

Common skill sources and packaging layers live in separate directories:

```text
common/
├── README.md
├── skills/
│   └── suiteskills/
│       └── netsuite-suiteskills-*/
└── layers/
    ├── suiteskills/
    │   ├── ID-REGISTER.json
    │   ├── INSTALL-LAYOUT.json
    │   └── shared/
    └── openai/
        └── assets/
```

`skills/suiteskills/` is the named `suiteskills` skill source for both SuiteSkills distributions. Existing plugins omit `skillSource` and continue to use `buildConfig.skillsRoot`. A plugin selecting a named source resolves all its skills exclusively there; unknown sources and missing skills fail validation. Each plugin retains its validated skill directories, so identical names in different sources cannot substitute for one another. Source roots must stay inside this package and pass directory, containment and symlink checks. All selected files still pass strict destination collision checks.

Add reusable packaging payloads to a `<layer-name>/` subdirectory in `layers/`, configured by `commonLayersRoot`. Each layer is copied after the plug-in-specific `src/` content and before the `LICENSE.txt` and `skills/` directory are generated. `commonLayers` accepts a layer name (all files) or an object with required `name`, nonempty `include` patterns and `exclude` patterns. Both forms apply global exclusions, preserve paths relative to the layer root and reject destination collisions; layers never overwrite other inputs.

Both SuiteSkills plugins select the same 151 literal paths from `layers/suiteskills/`: 149 `shared/...` resources plus `ID-REGISTER.json` and `INSTALL-LAYOUT.json`. These files are supplied exclusively by the common layer. Unlisted files in that layer are not packaged. Category skills retain their isolated shared copies. Root and category `shared/` resources remain packaged with explicit payload inventories. Current inventory hashes exclude INVENTORY.json itself, the builder-supplied LICENSE.txt and the generated native manifest; historical provenance digests remain unchanged.

Provider-specific READMEs, catalogs, changelogs, inventories and retained foundation snapshots remain local. OpenAI SuiteSkills consumes shared branding from `layers/openai/` with an explicit allowlist containing `assets/netsuite-icon.png` and `assets/netsuite-logo.png`. Its metadata remains provider-local, and its explicit inputs include only the five declared `src/skills/<unsuffixed-name>/agents/openai.yaml` files for skill display metadata; Anthropic includes none of those OpenAI files or branding PNGs. Other OpenAI plugins continue to consume the shared OpenAI layer. Manifests are generated from `plugin.build.json` in `.codex-plugin/` or `.claude-plugin/`; OpenAI has no source root `plugin.json`.

Run agent-skills validation and tests, then plugin validation and tests, then build and release verification as separate commands. Packaging checks do not establish native-host, model, account or output/runtime qualification. SuiteSkills 1.0.0 remains an internal testing candidate pending final validation and these qualifications; full-plugin security approval has been obtained.
