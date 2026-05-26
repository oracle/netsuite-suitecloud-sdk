# Authentication Flow (Current State)

## Scope
This describes how auth is handled across `node-cli`, `sdk-core` (TS), and Java.

## Responsibilities

### Node CLI: `packages/node-cli/src/utils/AuthSessionProvider.js`
- Adapter factory: `createCredentialSessionProvider(sdkPath, executionEnvironmentContext)`.
- Provides sdk-core with:
  - `resolveAuthSession(authId)`
  - `refreshAuthSession(authId)`
- Delegates both to Java-backed auth utility (`getAuthCredentialsById(...)`).

### TS Core: `packages/sdk-core/src/auth/AuthSessionManager.ts`
- Central auth retry orchestrator for TS command execution.
- Exposes:
  - `executeWithAuthRetry(...)`: runs command with credential session, retries once after refresh on auth failure.
  - `shouldRetryAuthByResult(...)`: retry decision based on normalized result (`401/403` and auth-related error patterns).
### Node CLI (Java bridge): `packages/node-cli/src/utils/AuthenticationUtils.js`
- Java-backed credential bridge and auth operations.
- `getAuthCredentialsById(...)` returns `{ hostName, accessToken }`.
- Uses Java SDK commands for:
  - auth info lookup
  - silent force refresh of authorization tokens
  - API key / proxy key secure operations (via Java-backed utilities/commands)
- Secure storage/token lifecycle remains Java-backed, not in TS core.

## Execution Flow

1. `node-cli` action gets `authId` and request parameters.
2. Action builds provider via `createCredentialSessionProvider(...)`.
3. Action calls `sdk-core` `executeWithAuthRetry(...)`.
4. First attempt:
   - provider resolves `{ hostName, accessToken }`
   - TS core command executes against endpoint(s).
5. If result indicates auth failure (`shouldRetryAuthByResult`):
   - provider refreshes credentials
   - command executes once more.
6. Final operation result is returned to node-cli output handlers.

## Where this is used now (TS-backed network commands)
- Project: `deploy`, `validate`, `preview`
- File: `list`, `import`, `upload`
- Object: `list`, `import`, `update`

## Design intent
- Java remains the secure credential/key system of record.
- TS core owns retry policy and command orchestration.
- Node CLI owns UX (interactive prompts, user-facing messages, preflight context checks).
