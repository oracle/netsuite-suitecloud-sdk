# SuiteApp Analyzer CLI POC — plan and architecture review

## Recommendation

Add **`suitecloud project:analyze`** as a new advisory command. Do not extend
`project:validate` and do not add an unscoped top-level `analyze` command.

`project:validate` validates SDF project structure and optionally the project
against an account. Analyzer performs a remote security assessment and returns
security findings. They have different endpoints, results, latency/failure
semantics, and CI policy. A distinct `project:analyze` follows existing
command naming (`project:deploy`, `project:package`, `project:validate`) while
leaving a natural future space for `project:analyze:rules`.

The POC is advisory: a completed scan with warnings or problems is successful.
Invalid input, auth/transport errors, malformed reports, or incomplete/unknown
analysis fail the command. It must not alter `project:deploy` or
`project:validate` behavior.

## Research summary

### Analyzer documentation

- [SuiteApp Analyzer Overview](https://confluence.nsgbu.netsuitecorp.com/spaces/~jachen/pages/1016150813/SuiteApp+Analyzer+Overview)
  specifies `AnalysisService.analyze(File zipFile, ScanMode scanMode)`, with
  `ScanType=SDF_BUNDLE` and a source enum such as `SUITE_CLOUD_CLI`. It asks
  for a distinct SuiteCloud CLI command, shared with the Control Center API,
  and recommends `SarifReport` as the stable extensible integration result.
- [Analyzer DevTools API](https://confluence.nsgbu.netsuitecorp.com/spaces/~jachen/pages/1408401626/Analyzer+DevTools+API)
  records the intended CLI POC and notes that warnings should not visually look
  like a clean result.
- [Control Center asynchronous-scanning POC](https://confluence.nsgbu.netsuitecorp.com/spaces/TCorpSec/pages/1478044131/Control+Center+Integration+POC+%E2%80%93+Asynchronous+Scanning+of+SuiteApps)
  uses `AnalyzerInternalResponse`/SARIF and defines unexpected errors or
  timeouts as `UNKNOWN`; partial reports need an explicit display policy.
- [Analysis Report SARIF Format](https://confluence.nsgbu.netsuitecorp.com/spaces/TCorpSec/pages/931269701/Analysis+Report+SARIF+Format)
  documents SARIF 2.1.0, including rules, results, locations, message IDs,
  partial fingerprints, and invocation status. Artifact URIs are relative;
  regions can be absent.
- [SuiteApp Analyzer Object Rules](https://confluence.nsgbu.netsuitecorp.com/spaces/TCorpSec/pages/494791204/SuiteApp+Analyzer+Object+Rules)
  shows active warning/problem rules such as unrestricted Suitelets, broad
  report audiences, unprotected server scripts, suspect unencrypted secrets,
  and permission mismatches. Rules and severities evolve, so the CLI must
  render backend metadata rather than duplicate rule logic.

### Repository architecture (`netsuite-suitecloud-sdk`)

This repository already owns both required layers:

| Concern | Current owner | Relevant implementation |
| --- | --- | --- |
| CLI command lifecycle/UI | `packages/node-cli` | `project:validate/{ValidateCommand,ValidateAction,ValidateInputHandler,ValidateOutputHandler}` |
| Command discovery | `packages/node-cli` | `SdkCommandsMetadata.json`, `CommandGenerators.json`, `CommandsMetadataService` |
| Authentication/retry/spinner | `packages/node-cli` | `ValidateAction`, `executeWithAuthRetry`, `executeWithSpinner` |
| Project archive/remote execution | `packages/sdk-core` | `commands/project/archive/ProjectArchive.ts`, `ProjectCommandExecutor.ts` |
| Legacy SDF API contract | `packages/sdk-core` | `ProjectCommandClient.ts`, `ProjectResultNormalizer.ts` |

The current `PROJECT_COMMAND` set is `DEPLOY`, `PREVIEW`, and `VALIDATE`.
`ProjectCommandClient` hard-codes the legacy SDF endpoint
`/api/internal/sdf/v1/projects`, multipart field `sdfProjectZip`, form field
`action`, SDF action header, SDF query parameters, and SDF response normalizer.
Analyzer must **not** be added to this enum/client: doing so would make an
unrelated API appear to have the SDF endpoint contract.

## POC UX

```text
suitecloud project:analyze
suitecloud project:analyze --project /path/to/suiteapp
suitecloud project:analyze --output /path/to/analyzer.sarif
suitecloud project:analyze --json
```

- Use the normal default project and `--authid` resolution.
- For this first CLI POC, accept a **SuiteApp project directory** and create
  the same canonical project archive used by current remote project commands.
  Do not advertise arbitrary ZIP input until the existing archive planner and
  Analyzer contract confirm that an already-built ZIP has the expected root,
  contents, and validation guarantees.
- `--json` writes raw SARIF only to stdout; progress/status goes to stderr or
  is suppressed. This preserves CI piping.
- `--output <path>` saves the unmodified SARIF document atomically and reports
  its path in human mode.
- Do not offer `--server`: analysis is inherently remote. Do not inherit
  validation-only flags such as `--applyinstallprefs` or
  `--accountspecificvalues`.

Human output should show completion state, totals by level, then one finding
per line: level, rule ID, relative path and optional source location, and
resolved message/short description. An incomplete/unknown result requires a
prominent warning and non-zero exit; absence of shown findings must never be
called clean unless completion is known.

| Outcome | Exit code |
| --- | --- |
| Completed scan, zero or more findings | 0 |
| Partial, unknown, or untrustworthy scan | non-zero |
| Input, auth, HTTP, timeout, or SARIF-contract error | non-zero |

An explicit future `--fail-on <level>` could make the command a CI gate, but
must not be part of this POC. Current Analyzer problem/warning labels are
product metadata, not an agreed CLI release-blocking policy.

## Target architecture

```text
project:analyze command metadata + generator
                  │
                  ▼
AnalyzeCommand → AnalyzeAction → auth retry/spinner
                  │
                  ▼
sdk-core executeAnalyzerProjectScan()
                  │             └─ reuse canonical project archive only
                  ▼
AnalyzerClient (dedicated endpoint, request, timeout, status mapping)
                  │
                  ▼
Analyzer SARIF parser/validator → result model → Node renderer / raw writer
```

### `packages/sdk-core` (source of truth for transport and report semantics)

1. Add `api/analyzer/AnalyzerScan.ts` with immutable request/result types:
   project folder, host, access token, `SDF_BUNDLE`, `SUITE_CLOUD_CLI`, timeout,
   raw-output choice, and a result containing completion state plus raw SARIF.
2. Add `commands/project/analyze/AnalyzerScanExecutor.ts`. It reuses the
   established project archive creator/cleanup only after confirming the archive
   applies to Analyzer. It must have its own bounded timeout and `finally`
   cleanup.
3. Add `AnalyzerClient.ts` as the sole owner of Analyzer endpoint configuration,
   multipart/JSON protocol, auth header, response reading, and HTTP-to-domain
   error mapping. No Analyzer string, URL, request part name, or scan source is
   hard-coded in Node CLI UI code.
4. Add a narrow SARIF 2.1.0 parser/validator and `AnalyzerReport` adapter. Keep
   the raw parsed document for `--json`/`--output`; extract only fields needed
   to render results. Resolve message IDs from rule `messageStrings`, retain
   rule ID and `defaultConfiguration.level`, preserve relative URI, and tolerate
   absent region/snippet.
5. Export only the new scanner API from `sdk-core` commands exports. Do not
   modify `executeProjectCommand`, `PROJECT_COMMAND`, `ProjectCommandClient`, or
   SDF result normalizer except for genuinely shared, independently tested
   archive helpers.

### `packages/node-cli` (command wiring and presentation)

1. Add `commands/project/analyze/` with `AnalyzeCommand`, `AnalyzeAction`, and
   `AnalyzeOutputHandler`; use an input handler only if project/auth selection
   truly needs interaction.
2. Add `project:analyze` metadata to `SdkCommandsMetadata.json` and its command
   generator to `CommandGenerators.json`. The generated command must be
   registered in the metadata map; otherwise CLI discovery/help will fail.
3. Mirror only the mature generic pieces of `ValidateAction`: default project
   / auth ID resolution, `createCredentialSessionProvider`, auth retry,
   spinner, and error conversion. Do not call `prepareValidateExecution` or
   construct `DeployActionResult`; introduce an `AnalyzeActionResult` if the
   current generic action-result types cannot accurately carry scan completion
   and raw SARIF.
4. Render the core result in `AnalyzeOutputHandler`. Use normal CLI log
   conventions in human mode and ensure `--json` is stdout-safe.
5. Add translations for scan start, clean completion, finding totals, incomplete
   scan, output-written, malformed report, and endpoint failure. Avoid adding
   client-owned names for individual security rules.

## Blocking endpoint contract

Do not begin transport implementation until the Analyzer owners provide a
versioned OpenAPI/specification or fixtures that answer all of these:

| Required decision | Why it is architectural |
| --- | --- |
| Endpoint path, pod/account routing, feature gate | Determines client configuration and availability behavior. |
| Exact request shape: multipart part name/content type and ScanMode encoding | Existing SDF multipart shape cannot be assumed. |
| OAuth audience/scopes and authorization errors | Determines CLI auth/retry support. |
| Sync or async protocol, status endpoint, deadline, cancellation | Determines executor lifecycle; async cannot be hidden behind an unbounded request. |
| Response envelope, SARIF version, error schema | Determines parser and raw-output compatibility. |
| Completion/partial/`UNKNOWN` semantics and retryability | Determines trust and exit code. |
| Size, timeout, rate limit, logging/retention/redaction rules | The ZIP can contain source and configuration, so operations/security requirements matter. |

Use a synchronous POC only if the service guarantees a bounded synchronous
response. If it is asynchronous, implement explicit submit/poll with a fixed
deadline and cancellation. Do not poll blindly or treat a timed-out request as
a no-findings response.

## Implementation sequence

1. **Contract spike:** obtain the endpoint contract and fixtures for clean,
   findings, invalid ZIP, 401/403, timeout, invalid SARIF, and
   partial/unknown results. Decide synchronous versus asynchronous execution.
2. **Core report contract:** implement SARIF adapter/validator and fixture
   tests. Agree on the minimum supported SARIF fields and pass unknown fields
   through raw output unchanged.
3. **Core transport:** implement dedicated client/executor, archive reuse, auth
   headers, timeout, status mapping, and cleanup tests.
4. **Node command:** add metadata, generator, action, output renderer,
   translations, `--json`, and atomic `--output` handling.
5. **E2E:** execute against an authorized non-production SuiteApp and verify
   display, raw SARIF, clean/finding/incomplete exit behavior, and no regression
   of deploy/validate.
6. **After POC approval:** document policies and consider opt-in `--fail-on`.

## Test plan

### sdk-core

- Archive uses the current canonical project content plan and always cleans up.
- Exact Analyzer request contract: URL/config key, headers, multipart fields,
  ZIP MIME type, `SDF_BUNDLE`, `SUITE_CLOUD_CLI`, timeout.
- 2xx clean and findings reports; no client-side severity reclassification.
- Rule message-ID lookup, inline messages, relative URI, no region, and absent
  optional SARIF fields.
- 401/403/4xx/5xx, network error, timeout, malformed JSON/SARIF, and
  partial/unknown mapping do not yield a false clean result.
- Raw SARIF is preserved byte/semantic-equivalently as agreed by contract.

### node-cli

- Help/discovery proves both metadata and generator registrations are aligned.
- Default project/auth ID, auth retry, option forwarding, and spinner behavior.
- Human renderer totals/findings/incomplete warning; `--json` has no prose mixed
  into stdout; `--output` is atomic and reports failures safely.
- Exit propagation: completed findings succeeds; incomplete and execution errors
  fail.

### regression and live verification

- Existing `project:validate`, `project:deploy`, and `project:package` unit
  tests remain green. Their SDF endpoint request tests must be unchanged.
- Add an environment-gated live contract test using an approved non-production
  account and test SuiteApp. Never use a customer/source-sensitive project.

## Architecture review conclusion

The dedicated `project:analyze` path is the correct boundary. It satisfies the
Analyzer team's API/SARIF direction and this repository's separation between
`node-cli` UI and `sdk-core` reusable execution logic. Reusing the project
archive helper is desirable; reusing the legacy SDF project client or result
normalizer is not.

Approval is still contingent on the endpoint contract, sync/async decision,
authorization model, completion semantics, ZIP-data handling, and the advisory
exit policy above. Those decisions are intentionally recorded as gates because
they determine whether the CLI can make a trustworthy security statement.
