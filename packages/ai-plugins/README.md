# AI Agent Plug-ins Workspace

This workspace builds source-managed plug-in directories for distribution through OpenAI and Anthropic from `plugin.build.json` files. Each plug-in declares its resources in its own `plugin.build.json`.

`metadata` is copied directly to the generated manifest root for both providers. The build then injects the build-owned `version` and `skills` fields. For OpenAI plug-ins, UI-manifest fields belong to `metadata.interface`; this object is preserved exactly, including future JSON-compatible interface properties. Anthropic metadata, including nested properties such as `interface`, are also passed through unchanged.

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

`<provider>/<plugin-id>` is one of `anthropic/netsuite-ai-connector-companion`, `anthropic/netsuite-finance-analyst`, `anthropic/netsuite-suitecloud`, `openai/netsuite-ai-connector-companion`, `openai/netsuite-finance-analyst`, or `openai/netsuite-suitecloud`.
You can also target a plug-in by bare ID only when that ID is unique; these provider plug-ins have duplicate IDs and require the qualified key.

Generated output is written only to `dist/ai-plugins/` and should never be edited by hand.

## Distribution and Releases

Release operators should follow the [AI Agent Plug-ins Distribution and Release Guide](DISTRIBUTION.md). The manually dispatched **Publish AI Agent Plug-ins Dist** workflow is the standard release path.
