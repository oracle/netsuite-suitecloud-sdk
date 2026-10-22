# SuiteSkills visualization change notes

## Included in SuiteSkills 1.0.0

Data Visualization source version: 2.2.0-rc.1.

Data Visualization (RB-OPS-020) accepts supplied files/tables and supported NetSuite or other producer results with provenance, without requiring Finance Analyst. Money requires explicit currency and compatible series/interval units. Missing values remain distinct from zero; the renderer performs no local totals or FX conversion.

The secured renderer uses the Ocean header, grey canvas, twelve-color palette, flat panels, compact KPI strip and responsive layout. Script-safe JSON, text nodes, pinned assets/CSP, account-bound route validation, safe fresh basenames and exclusive directory-bound publication remain required. Without verified account-origin evidence, record references remain plain text. The legacy authored HTML and template/export binaries are excluded.

### Runtime and delivery limits

Follow the runbook's [runtime and host delivery procedure](skills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization/references/delivery.md) for exact execution gates. Python 3.12 and the runbook's declared dependencies are required. HTML capability probing is separate from browser/font availability. The runtime gates recognize local Darwin/APFS and the exact Linux glibc 2.39 little-endian LP64 x86_64/aarch64 ext-family HTML candidate profile; other layouts fail closed. Exact-host qualification remains required. This does not broaden the separate shared writers' Darwin requirements.

PDF and PowerPoint require an explicit request and qualified Darwin export dependencies, including the applicable browser/Playwright/Chromium, font and PDF tooling. Graphical PowerPoint generation, native rendering and PDF validity require separate validation. Externally supplied software and fonts retain their own license terms.

Generate outside installed assets. Managed host delivery is separate from source publication: use a fresh random basename, an immediate destination check, the observed host transfer facility and identity/readback verification. The collision-avoidance destination profile can race and does not guarantee atomic no-replacement. Hashes do not authenticate account access or transport. Unsupported execution/export fails closed or provides the documented factual fallback where permitted.

Installed-host delivery, model/account behavior, Linux execution and output/runtime support require exact-host qualification. Local or synthetic checks do not establish those results.
