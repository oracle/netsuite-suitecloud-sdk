# AI Plugins Workspace

This workspace builds source-managed plugin directories for OpenAI and Anthropic distribution from `plugin.build.json` files.
Each plugin declares its resources in its own `plugin.build.json`.

## Commands

Run from the repository root:

```sh
npm run validate --workspace @oracle/ai-plugins
npm run test --workspace @oracle/ai-plugins
npm run build --workspace @oracle/ai-plugins
npm run build:one --workspace @oracle/ai-plugins -- <provider>/<plugin-id>
npm run verify-release --workspace @oracle/ai-plugins
```

`<provider>/<plugin-id>` is one of `anthropic/netsuite-ai-connector-companion`, `anthropic/netsuite-finance-analyst`, `anthropic/netsuite-suitecloud`, `openai/netsuite-ai-connector-companion`, `openai/netsuite-finance-analyst`, or `openai/netsuite-suitecloud`.
You can target a plugin by bare ID only when that ID is unique; these provider plugins have duplicate IDs and require the qualified key.

Generated output is written only to `dist/ai-plugins/` and should never be edited by hand.

## Distribution and releases

Release operators should follow the [AI Plugins Distribution and Release Guide](DISTRIBUTION.md). The manually dispatched **Publish AI Plugins Dist** workflow is the standard release path.
