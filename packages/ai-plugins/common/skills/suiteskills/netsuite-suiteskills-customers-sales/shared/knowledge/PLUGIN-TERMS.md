# Shared runtime terminology

Revision: shared-guidance-2026-10-08. These canonical project terms apply wherever relevant; this is not an exhaustive list of supported concepts. This concise runtime resource accompanies the publisher's full plugin glossary.

- Plugin: the host package containing category entry points and dependencies.
- Category skill: a host-registered SKILL.md selecting among related business runbooks.
- Runbook: the supporting business procedure in RUNBOOK.md; not another registered entry point.
- Shared resource: a canonical instruction, token, schema or helper, maintained in the plugin-level shared/ directory with hashes and loaded by categories/runbooks when relevant.
- Local helper: code running in the conversational host's permitted file/code environment. It does not execute inside NetSuite or grant connector permissions.
- Synthetic: fictional fixture data; never account evidence.
- Observed: supplied retrieved evidence classification; the renderer cannot attest its source or completeness.
- Complete: complete within the declared scope. Partial: some requested population or sections are uncollected. Empty: successful retrieval with no matching rows. Failed: no valid result established.
- Not run: a test has not executed. Not observed: a fact was not established. Neither means absent, zero or failed.
- Native report: a NetSuite report retrieved through the connector. Report summary artifact: a local presentation of returned report facts; never a claim of a complete native report export.

- Runbook ID: `RB-<CATEGORY>-<NNN>`; category and number allocations persist. Earlier `WF-` IDs are compatibility aliases.
- Runbook name/folder: `netsuite-<business-name>`; entrypoint: `runbooks/<name>/RUNBOOK.md`, with `metadata.runbook-id` in its header.
- Workflow: an ordinary business process or a source helper/API term, not the current packaged unit or ID prefix. Source APIs such as `primary_workflow.py` keep their names.
