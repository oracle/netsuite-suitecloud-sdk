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

`<provider>/<plugin-id>` is one of `anthropic/netsuite-ai-companion`, `anthropic/netsuite-finance-analyst`, `anthropic/netsuite-suitecloud`, `openai/netsuite-ai-companion`, `openai/netsuite-finance-analyst`, `openai/netsuite-suitecloud`, `anthropic/netsuite-suiteskills`, or `openai/netsuite-suiteskills`.
Build commands also accept a bare ID when it is unique; these provider plug-ins have duplicate IDs and require the qualified key.

Builds write directories only to `dist/ai-plugins/`. Never edit generated output by hand.

## Distribution and Releases

Release operators should follow the [AI Agent Plug-ins Distribution and Release Guide](DISTRIBUTION.md). The manually dispatched **Publish AI Agent Plug-ins Dist** workflow is the standard release path.

## SuiteSkills sources

Edit skills in `common/skills/suiteskills/`, shared guidance in `common/layers/suiteskills/`, and provider inputs in `<provider>/netsuite-suiteskills/`. Update isolated shared copies together with the canonical shared layer. Installed README links resolve in the assembled distribution.

`skillSources.suiteskills` selects the SuiteSkills source tree. Plug-ins without `skillSource` use `skillsRoot`. A selected source resolves all skills exclusively within that source. Source roots must remain inside this package and pass containment and symlink checks.

Packaging layers live under `commonLayersRoot`. `commonLayers` accepts a layer name or an object with `name`, nonempty `include` patterns and `exclude` patterns. Global exclusions and destination collision checks apply to both forms. SuiteSkills selects literal shared resource paths; unlisted layer files are not packaged.

SuiteSkills uses unsuffixed `skills/netsuite-suiteskills-*/` paths, with isolated shared resources in each skill. The build generates `.claude-plugin/plugin.json` for Anthropic and `.codex-plugin/plugin.json` for OpenAI from the provider recipes. OpenAI packages include five provider-local `agents/openai.yaml` files and shared NetSuite PNG branding; these assets are excluded from Anthropic packages. For ZIP packaging and Anthropic upload layout, follow the [distribution guide](DISTRIBUTION.md#zip-packaging).

After changing packaged resources, refresh resource maps, foundation snapshots, the onboarding foundation lock and provider inventories. Preserve component versions and source provenance hashes. Inventories exclude themselves, the generated provider manifest and builder-supplied `LICENSE.txt`.

## Additional checks

Run both workspaces' validators and JavaScript suites before building:

```sh
npm run validate --workspace @oracle/agent-skills
npm test --workspace @oracle/agent-skills
python3 -I -S packages/ai-plugins/test/test_suiteskills_visualizer.py
```

The visualizer regression suite requires the Python version configured in the [CI](../../.github/workflows/ai-plugins-ci.yml) and [publishing](../../.github/workflows/ai-plugins-dist.yml) workflows and runs separately from `npm test`, without pip packages. File generation still requires the runbook's declared runtime dependencies. Qualify installed-host loading, model behavior, live-account workflows and export/delivery support separately on the target host. Package and local regression checks do not establish that support.

Local release verification requires a compatible Claude Code on PATH when Anthropic packages are present, meeting the minimum version enforced by [the release verifier](scripts/verify-release.mjs), including support for [directory listing fields](https://code.claude.com/docs/en/plugins-reference#directory-listing-fields). It rejects missing, unusable or incompatible validators and runs `claude plugin validate --strict` for each Anthropic package. OpenAI-only workspaces do not require Claude.
