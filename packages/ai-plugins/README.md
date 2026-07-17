# AI Plugins Workspace

This workspace builds source-managed plugin directories for OpenAI and Anthropic distribution from `plugin.build.json` files.
Each plugin declares its resources in its own `plugin.build.json`.

## Commands

Run from the repository root:

```sh
npm run validate --workspace @oracle/ai-plugins
npm run test --workspace @oracle/ai-plugins
npm run build --workspace @oracle/ai-plugins
npm run build:one --workspace @oracle/ai-plugins -- <plugin-source-dir>
npm run verify-release --workspace @oracle/ai-plugins
```

`<plugin-source-dir>` is one of `claude-ai-connector-plugin`, `codex-ai-connector-plugin`, `claude-suitecloud-plugin`, or `codex-suitecloud-plugin`.
You can also target a plugin by published plugin ID.

Generated output is written only to `dist/ai-plugins/` and should never be edited by hand.

## Distribution and releases

Release operators should follow the [AI Plugins Distribution and Release Guide](DISTRIBUTION.md). The manually dispatched **Publish AI Plugins Dist** workflow is the standard release path.
