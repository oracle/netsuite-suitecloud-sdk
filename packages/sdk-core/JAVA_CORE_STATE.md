# Java Core State (Current)

## Scope
This file documents what is still expected from the Java CLI backend (`suitecloud-sdk`) after TS migration work.

## Java responsibilities kept on purpose

1. Secure credential storage and retrieval
- Resolve credentials by `authid` for TS-backed commands.
- Keep token handling in secure storage implementation.

2. Authorization refresh primitives
- Refresh/re-auth flows used by node-cli + sdk-core retry wrapper.

3. API key / proxy key secure operations
- Generate/read/update key material through Java secure utilities.

4. Legacy direct commands not fully migrated yet
- `project:adddependencies` command execution.
- `account:manageauth` execution path.

## What moved out of Java (primary execution now in TS)

- Project API command orchestration: `deploy`, `validate`, `preview`.
- File API command orchestration: `list`, `import`, `upload`.
- Object API command orchestration: `list`, `import`, `update`.
- Local generation flows: `project:create`, `project:package`, `file:create`, `object:create`.

## Runtime integration model

1. `node-cli` handles command routing, prompts, output rendering, and preflight validation.
2. `sdk-core` handles command orchestration and endpoint calls.
3. Java is called from node-cli bridge only for secure auth/key operations and limited legacy direct commands.

## Current design guardrail

Java should remain a minimal security-focused backend. New business logic should be added in TS unless it is strictly tied to secure storage or token/key lifecycle internals.
