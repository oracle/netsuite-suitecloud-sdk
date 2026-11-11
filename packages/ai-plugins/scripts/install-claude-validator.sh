#!/usr/bin/env bash
# Install only the release validator; do not run the self-updating installer.
set -euo pipefail

: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
: "${GITHUB_PATH:?GITHUB_PATH is required}"
: "${GITHUB_ENV:?GITHUB_ENV is required}"
test "$(uname -s)" = Linux
test "$(uname -m)" = x86_64

version=2.1.281
# https://downloads.claude.ai/claude-code-releases/2.1.281/manifest.json
sha256=56fe3da88458465fb27d7e9299dddb3fead55750fb9c2de795f233b5eea6dce1
validator_dir="$(mktemp -d "${RUNNER_TEMP}/claude-validator.XXXXXX")"
trap 'rm -f "${validator_dir}/claude.download"' EXIT
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
  --connect-timeout 15 --max-time 180 --retry 2 --retry-max-time 360 \
  "https://downloads.claude.ai/claude-code-releases/${version}/linux-x64/claude" \
  --output "${validator_dir}/claude.download"
printf '%s  %s\n' "${sha256}" "${validator_dir}/claude.download" | sha256sum --check --strict
mv "${validator_dir}/claude.download" "${validator_dir}/claude"
chmod 755 "${validator_dir}/claude"
export DISABLE_AUTOUPDATER=1
test "$(timeout 30 "${validator_dir}/claude" --version)" = "${version} (Claude Code)"
printf '%s\n' "${validator_dir}" >> "${GITHUB_PATH}"
printf '%s\n' 'DISABLE_AUTOUPDATER=1' >> "${GITHUB_ENV}"
