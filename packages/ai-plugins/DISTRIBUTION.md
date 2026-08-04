# AI Plug-ins Distribution and Release Guide

This guide is the release reference for the generated AI plug-in artifacts published on the `ai-plugins-dist` orphan branch. Source remains on the repository's normal branches; the distribution branch contains only generated release content at its root.

## GitHub Actions Workflows

Two workflows support AI plug-in changes:

- **AI Plug-ins CI** runs automatically for pull requests and pushes to `master` when relevant AI plug-in source, shared skills, package files, license files, ignore files, or workflow files change. It validates configuration, runs tests, builds the plug-ins, and verifies the release output.
- **Publish AI Plug-ins Dist** is manually dispatched and executes only when dispatched from `master`. Dispatches from other refs intentionally skip its `publish` job. Use it for an intentional distribution release after the source change has been merged and validated. It runs mandatory security gates, validates, tests, and builds the plug-ins, then publishes the generated output to `ai-plugins-dist`.

CI is merge-blocking only when the target branch's protection rules require the **AI Plug-ins CI** status check. The workflow itself validates changes but does not independently prevent a merge.

## Standard Release Procedure

1. Merge the intended source changes to `master` and confirm the applicable **AI Plug-ins CI** run succeeds.
2. In GitHub Actions, manually run **Publish AI Plug-ins Dist** from `master`. Dispatches from any other ref are skipped and do not write the distribution branch or tags.
3. Consume the generated plug-in directories from the `ai-plugins-dist` branch and the version tags created for changed plug-ins.

The publisher is the standard release mechanism. Do not edit the distribution branch by hand.

### Publisher Behavior and Guardrails

The publisher:

- executes only from `master`; manually dispatched runs from any other ref skip publishing;
- fails closed before publishing when the repository-owned security gate detects a high-confidence credential in source or generated output, detects an unpinned external Action, credential-persisting checkout, or missing top-level workflow permissions, or when `npm audit` reports a High or Critical locked-dependency vulnerability;
- runs `validate`, `test`, and `build` for `@oracle/ai-plugins` before publishing;
- creates a sorted SHA-256 manifest after source-versus-build verification and verifies the downloaded artifact against it before any write-scoped Git credential is configured;
- updates the orphan `ai-plugins-dist` branch only when generated plug-in output has changed;
- requires a version increase when an already published plug-in's content changes;
- removes a distribution directory when its generated plug-in is removed from source; and
- creates a tag for every changed plug-in in the form `ai-plugin/<provider>/<plugin-id>/v<version>`.

Each distribution update also generates a branch-root `README.md` identifying the source branch used for that release. The branch root is otherwise limited to generated plug-in directories:

- `anthropic/netsuite-ai-connector-companion/`
- `anthropic/netsuite-finance-analyst/`
- `anthropic/netsuite-suitecloud/`
- `openai/netsuite-ai-connector-companion/`
- `openai/netsuite-finance-analyst/`
- `openai/netsuite-suitecloud/`

## Local Fallback Procedure

Use this only when a maintainer must publish manually. The manual process must produce the same branch-root layout and generated `README.md` as the automated publisher.

### Prerequisites

- Run commands from the repository root unless noted otherwise.
- `git worktree` and `rsync` must be available.
- Start from the exact source commit to release.
- Before syncing, run the same source checks as CI:

```sh
npm run validate --workspace @oracle/ai-plugins
npm run test --workspace @oracle/ai-plugins
npm run build --workspace @oracle/ai-plugins
npm run verify-release --workspace @oracle/ai-plugins
```

For every plug-in whose generated content changes, increase its version in `plugin.build.json` before publishing. Tag each changed plug-in as `ai-plugin/<provider>/<plugin-id>/v<version>` after the distribution commit is pushed.

### Create the Distribution Worktree Once

Create a sibling worktree for the orphan branch:

```sh
git worktree add --orphan --no-checkout ../ai-plugins-dist ai-plugins-dist
git -C ../ai-plugins-dist checkout --orphan ai-plugins-dist
git -C ../ai-plugins-dist rm -rf --ignore-unmatch .
```

### Sync and Publish

For the initial release and all later releases, synchronize the generated output. Reuse the existing worktree for later releases.

```sh
rsync -a --delete --exclude .git dist/ai-plugins/ ../ai-plugins-dist/
printf '%s\n' '# AI Plug-ins Distribution' '' 'Generated plug-in directories published from the `master` branch source tree.' > ../ai-plugins-dist/README.md
git -C ../ai-plugins-dist status --short
git -C ../ai-plugins-dist add -A
git -C ../ai-plugins-dist commit -m "Publish AI plug-ins from $(git rev-parse HEAD)"
git -C ../ai-plugins-dist push -u origin ai-plugins-dist
```

On recurring releases, omit `-u` from the final push if the worktree already tracks `origin/ai-plugins-dist`. The standard publisher is restricted to `master`; a manual fallback release must also originate from `master`.

Create and push a tag for each changed plug-in, substituting its provider-qualified published ID and version:

```sh
git -C ../ai-plugins-dist tag -a ai-plugin/<provider>/<plugin-id>/v<version> -m "Release <provider>/<plugin-id> v<version>"
git -C ../ai-plugins-dist push origin ai-plugin/<provider>/<plugin-id>/v<version>
```

## Verification

Before committing a manual fallback release, inspect the distribution worktree:

```sh
git -C ../ai-plugins-dist status
find ../ai-plugins-dist -mindepth 2 -maxdepth 2 -type d | sort
```

It should contain the generated plug-in directories for the source revision and the generated branch-root `README.md`. It must not contain normal source files such as `package.json`, `packages/`, or a nested `dist/ai-plugins/` directory.

## Guardrails

- Never edit generated plug-in contents in `ai-plugins-dist`; regenerate and republish from source.
- A security or integrity gate failure blocks publication. Correct the issue in a new `master` commit, then dispatch a new release run; do not reuse a failed run's artifacts.
- Do not publish changed plug-in content without a version increase.
- Inspect the distribution worktree before committing a manual fallback release.
- Keep the distribution worktree separate from the source checkout.

### Repository-Owned Security Gate

The release workflow runs `packages/ai-plugins/scripts/release-security-gates.mjs` before dependency installation and again after build output is generated. It intentionally has no external scanner Action or container-image dependency. The source scan excludes `.git`, `node_modules`, and source `dist`; generated output is scanned directly.

The gate is fail-closed for a focused policy baseline: GitHub token formats, AWS access keys, private-key material, and credential-shaped bearer values; plus workflow Action SHA pinning, non-persistent checkout credentials, and explicit top-level permissions. It is intentionally narrower than dedicated third-party secret and workflow scanners, and must not be treated as equivalent coverage.
