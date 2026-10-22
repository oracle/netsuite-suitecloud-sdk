# Shared AI Agent Plug-ins Sources

Add reusable payloads to a `<layer-name>/` subdirectory in `layers/`, configured by `commonLayersRoot`, and select the layer through `commonLayers` in the plug-in’s `plugin.build.json`. The builder copies configured inputs, selected common-layer files, `LICENSE.txt`, and selected skill files, then generates the native manifest. Layer filters and global exclusions apply; destination collisions fail the build.

SuiteSkills skills live in `skills/suiteskills/`; shared resources live in `layers/suiteskills/`. OpenAI branding lives in `layers/openai/`. See [development instructions](../DEVELOPMENT.md) for source selection, allowlists and validation.
