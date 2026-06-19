# Command Execution Map (Short Form)

This is a concise runtime map for current command execution paths.

## Legend
- `node-cli Action`: command entrypoint and UX handling.
- `sdk-core`: TS handler/executor (command logic + endpoint calls).
- `Java (direct)`: `_sdkExecutor.execute(...)` command execution in Java.
- `Java (auth/secure)`: secure credential/token/api-key operations only.
- Ownership tags in flows:
  - `[node-cli]`
  - `[sdk-core]`
  - `[java]`

## Per-command flow

| Command | High-level flow | Java usage |
|---|---|---|
| `project:deploy` | User -> `[node-cli] CommandActionExecutor` preflight (`suitecloud.config.js` + `defaultProjectFolder` + `manifest.xml` + `deploy.xml`) -> `[node-cli] DeployAction` -> `[sdk-core] AuthSessionManager.executeWithAuthRetry` -> `[sdk-core] ProjectCommandExecutor.executeProjectCommand` -> output | `Java (auth/secure)` via `createCredentialSessionProvider` |
| `project:validate` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] ValidateAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ProjectCommandExecutor` -> output | `Java (auth/secure)` |
| `project:preview` (`deploy --dryrun`) | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] DeployAction._preview` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ProjectCommandExecutor (PREVIEW)` -> output | `Java (auth/secure)` |
| `project:create` | User -> `[node-cli] CreateProjectAction` -> `[sdk-core] CreateProjectHandler` + `[sdk-core] CreateProjectWorkflowExecutor/CreateProjectExecutor` -> local project structure -> output | none (normal path) |
| `project:package` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] PackageAction` -> `[sdk-core] PackageHandler` + `[sdk-core] PackageProjectExecutor` -> local zip packaging -> output | none (normal path) |
| `project:adddependencies` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] AddDependenciesAction` -> `[sdk-core] AddDependenciesHandler` (normalization/default `all=true`) -> `[java] _sdkExecutor.execute(...)` -> output | `Java (direct)` + `Java (auth/secure)` as needed |
| `file:list` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] ListFilesAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ListFilesHandler.executeListFilesCommand` -> output | `Java (auth/secure)` |
| `file:import` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] ImportFilesAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ImportFilesHandler.executeImportFilesCommand` -> output | `Java (auth/secure)` |
| `file:upload` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] UploadFilesAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] UploadFilesHandler.executeUploadFilesCommand` -> output | `Java (auth/secure)` |
| `file:create` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] CreateFileAction` -> `[sdk-core] CreateFileHandler` + `[sdk-core] CreateFileExecutor` -> local file generation -> output | none (normal path) |
| `object:list` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] ListObjectsAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ListObjectsHandler.executeListObjectsCommand` -> output | `Java (auth/secure)` |
| `object:import` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] ImportObjectsAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] ImportObjectsHandler.executeImportObjectsCommand` (+ list prefetch) -> output | `Java (auth/secure)` |
| `object:update` | User -> `[node-cli] CommandActionExecutor` preflight -> `[node-cli] UpdateAction` -> `[sdk-core] AuthSessionManager` -> `[sdk-core] UpdateObjectsHandler` executors -> output | `Java (auth/secure)` |
| `object:create` | User -> `[node-cli] CreateObjectAction` -> local template/file creation -> output | none (normal path) |
| `proxy:start` | User -> `[node-cli] ProxyStartAction` -> proxy service/events + refresh hooks -> output | `Java (auth/secure)` (auth refresh + key resolution path) |
| `proxy:generatekey` | User -> `[node-cli] ProxyGenerateKeyAction` -> `[sdk-core] ProxyGenerateKeyHandler` (key content validation/update) -> `[java] key content read/write utils` -> output | `Java (auth/secure)` for key content persistence |
| `account:setup` | User -> `[node-cli] SetupAction` -> `[sdk-core] SetupAccountHandler` (normalization) -> `[java] oauth auth flow` -> output | `Java (auth/secure)` |
| `account:setupci` | User -> `[node-cli] AccountSetupCiAction` -> `[sdk-core] SetupAccountCiHandler` (normalization) -> `[java] CI auth/select flow` -> output | `Java (auth/secure)` |
| `account:manageauth` | User -> `[node-cli] ManageAccountAction` (+ `[sdk-core] ManageAuthHandler` option selection/sanitization) -> `[java] _sdkExecutor.execute(manageauth)` -> output | `Java (direct)` |

## Security intent
- Keep business/execution orchestration in TS (`sdk-core` + node-cli actions).
- Keep Java focused on secure credential/token/key primitives and targeted legacy direct commands not yet migrated (currently: `project:adddependencies`, `account:manageauth`).
