# AI Plug-ins Workspace

This workspace builds source-managed plug-in directories for distribution through OpenAI and Anthropic from `plugin.build.json` files.
Each plug-in declares its resources in its own `plugin.build.json`.

## Commands

Use these commands to validate, test, build, and verify the plug-in distributions.

Run from the repository root:

```sh
npm run validate --workspace @oracle/ai-plugins
npm run test --workspace @oracle/ai-plugins
npm run build --workspace @oracle/ai-plugins
npm run build:one --workspace @oracle/ai-plugins -- <provider>/<plugin-id>
npm run verify-release --workspace @oracle/ai-plugins
```

`<plugin-source-dir>` is one of `claude-ai-connector-plugin`, `codex-ai-connector-plugin`, `claude-suitecloud-plugin`, or `codex-suitecloud-plugin`.
You can also target a plug-in by its published plug-in ID.

Generated output is written only to `dist/ai-plugins/` and should never be edited by hand.

## Distribution and Releases

Release operators should follow the [AI Plug-ins Distribution and Release Guide](DISTRIBUTION.md). The manually dispatched **Publish AI Plugins Dist** workflow is the standard release path.
