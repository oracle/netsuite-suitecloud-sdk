# AI Plugins Distribution and Release Guide

This guide is the release reference for the generated AI plugin artifacts published on the `ai-plugins-dist` orphan branch. Source remains on the repository's normal branches; the distribution branch contains only generated release content at its root.

## GitHub Actions workflows

Two workflows support AI plugin changes:

- **AI Plugins CI** runs automatically for pull requests and pushes to `master` when relevant AI plugin source, shared skill, package, license, ignore-file, or workflow files change. It validates configuration, runs tests, builds the plugins, and verifies the release output.
- **Publish AI Plugins Dist** is manually dispatched. Use it for an intentional distribution release after the source change has been merged and validated. It validates, tests, and builds the plugins, then publishes the generated output to `ai-plugins-dist`.

CI is merge-blocking only when the target branch's protection rules require the **AI Plugins CI** status check. The workflow itself validates changes but does not independently prevent a merge.

## Standard release procedure

1. Merge the intended source changes to `master` and confirm the applicable **AI Plugins CI** run succeeds.
2. In GitHub Actions, manually run **Publish AI Plugins Dist** from the source revision to release (normally `master`).
3. Consume the generated plugin directories from the `ai-plugins-dist` branch and the version tags created for changed plugins.

The publisher is the standard release mechanism. Do not edit the distribution branch by hand.

### Publisher behavior and guardrails

The publisher:

- runs `validate`, `test`, and `build` for `@oracle/ai-plugins` before publishing;
- updates the orphan `ai-plugins-dist` branch only when generated plugin output has changed;
- requires a version increase when an already published plugin's content changes;
- removes a distribution directory when its generated plugin is removed from source; and
- creates a tag for every changed plugin in the form `ai-plugin/<provider>/<plugin-id>/v<version>`.

Each distribution update also generates a branch-root `README.md` identifying the source branch used for that release. The branch root is otherwise limited to generated plugin directories:

- `anthropic/netsuite-ai-connector-companion/`
- `anthropic/netsuite-finance-analyst/`
- `anthropic/netsuite-suitecloud/`
- `openai/netsuite-ai-connector-companion/`
- `openai/netsuite-finance-analyst/`
- `openai/netsuite-suitecloud/`

## Local fallback procedure

Use this only when a maintainer must publish manually. It must produce the same branch-root layout and generated `README.md` as the automated publisher.

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

For every plugin whose generated content changes, increase its manifest version before publishing. Tag each changed plugin as `ai-plugin/<provider>/<plugin-id>/v<version>` after the distribution commit is pushed.

### Create the distribution worktree once

Create a sibling worktree for the orphan branch:

```sh
git worktree add --orphan --no-checkout ../ai-plugins-dist ai-plugins-dist
git -C ../ai-plugins-dist checkout --orphan ai-plugins-dist
git -C ../ai-plugins-dist rm -rf --ignore-unmatch .
```

### Sync and publish

For the initial release and all later releases, rebuild and synchronize the generated output. Reuse the existing worktree for later releases.

```sh
rsync -a --delete --exclude .git dist/ai-plugins/ ../ai-plugins-dist/
printf '%s\n' '# AI Plugins Distribution' '' 'Generated plugin directories published from the `master` branch source tree.' > ../ai-plugins-dist/README.md
git -C ../ai-plugins-dist status --short
git -C ../ai-plugins-dist add -A
git -C ../ai-plugins-dist commit -m "Publish AI plugins from $(git rev-parse HEAD)"
git -C ../ai-plugins-dist push -u origin ai-plugins-dist
```

On recurring releases, omit `-u` from the final push if the worktree already tracks `origin/ai-plugins-dist`. Replace `master` in the generated README command only if releasing from another source branch.

Create and push a tag for each changed plugin, substituting its provider-qualified published ID and version:

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

It should contain the six generated provider-nested plugin directories listed above and the generated branch-root `README.md`. It must not contain normal source files such as `package.json`, `packages/`, or a nested `dist/ai-plugins/` directory.

## Guardrails

- Never edit generated plugin contents in `ai-plugins-dist`; regenerate and republish from source.
- Do not publish changed plugin content without a version increase.
- Inspect the distribution worktree before committing a manual fallback release.
- Keep the distribution worktree separate from the source checkout.
