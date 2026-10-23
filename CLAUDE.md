# SDFBuild - NetSuite SuiteCloud Development Framework

This is Oracle NetSuite's official open-source SuiteCloud Development Framework monorepo.

## Skills

- `.claude/skills/netsuite-suitecloud.md` — Master skill for NetSuite SuiteCloud development including SDF CLI, SuiteScript, SuiteAgents, NetSuite MCP, unit testing, UIF/SPA, roles/permissions, and AI Connector guardrails.

## Repository Structure

- `packages/node-cli` — SuiteCloud CLI for Node.js
- `packages/vscode-extension` — VS Code extension for SuiteCloud
- `packages/unit-testing` — Jest-based SuiteScript unit testing (`@oracle/suitecloud-unit-testing`)
- `packages/agent-skills` — AI agent skills for NetSuite development

## Key References

- SuiteScript modules metadata: `packages/node-cli/src/metadata/SuiteScriptModulesMetadata.js`
- Script types metadata: `packages/node-cli/src/metadata/SuiteScriptTypesMetadata.js`
- Object types metadata: `packages/node-cli/src/metadata/ObjectTypesMetadata.js`
- CLI commands: `packages/node-cli/src/commands/`
- Existing agent skills: `packages/agent-skills/`
