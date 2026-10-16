# Coordinate service-report agents

Use this workflow when the requested work benefits from separate template, configuration, and validation roles. It supplements the existing workflows; delegation does not authorize publication, activation, or extra account access.

## Coordinator

The main agent owns user communication, scope, approvals, the current handoff record, and the final result. Pass each worker the absolute skill root, applicable workflow, requested stage, assigned role, output paths, target account and report family, relevant discovery evidence, and the user's decisions and authorization. Include the [report workflow index](index.md) and [source policy](../../references/service-reports/source-index.md#source-policy); return checked and unchecked sources under that policy. Workers read the supplied skill root's `SKILL.md`, their coordination role, and assigned workflow. They must not assume they inherit the conversation; return a missing skill root or required handoff information to the coordinator. The coordinator resolves missing information and permissions with the user only when required; reuse authorization already given for the same exact action and revision.

Assign one owner per local artifact and one configuration agent as the sole NetSuite writer for the run. Do not let the coordinator or a replacement worker write concurrently with that agent. Before transferring ownership, stop or await the previous writer and read the affected account state. Use connected NetSuite MCP tools for account access; do not infer account-browser access. All workers retain the connector-only account boundary. A local preview browser may inspect only local report artifacts; it must not navigate to NetSuite.

Do not force a fixed worker count. Template work and account discovery can overlap; validation starts when its inputs are ready. Use the available concurrency limit. A worker returns a bounded result to the coordinator and does not spawn additional workers.

## Template agent

- Own the local HTML, XML, and field manifest in the assigned output directory. Follow [draft preview](template.md#draft-or-revise-an-html-preview), [prepare template](template.md#prepare-xml-from-an-accepted-design), or [edit existing XML](template.md#edit-existing-xml) as appropriate, using the [NetSuite XML/BFO reference](../../references/service-reports/netsuite-xml-bfo.md).
- Use the configuration agent's verified data contract. A layout with placeholders may be prepared while discovery runs; unresolved bindings prevent claiming the XML is ready for publication.
- For a preview-only assignment, return the HTML path, current field manifest, and unresolved discovery items; XML is not required. For an XML handoff, return the exact XML path, byte size, SHA-256, field manifest, relevant source changes, and validation limitations.
- Return validation results and unresolved issues for both preview and XML assignments.
- Retain each handed-off XML revision as a separate immutable file or snapshot. Continue editing a working copy. A subsequent revision invalidates checks tied to the previous hash, but must not replace the approved revision's bytes. The configuration agent recomputes the local hash immediately before upload and reconciles any mismatch before writing.
- Do not upload files, change NetSuite records, activate configurations, or modify the configuration agent's artifacts. Return requested mapping changes to the coordinator for the configuration agent to assess.

## Configuration agent

- Own account discovery, the proposed configuration diff, and all authorized NetSuite writes. Follow [account discovery](../../references/service-reports/account-discovery.md), [publication](publication.md#publish-the-template-and-prepare-configuration), and [activation](publication.md#activate-and-verify) for the requested stage only.
- Return missing authorization to the coordinator before dependent work. Do not edit template artifacts.
- First verify the original active configuration, exact report template path, and report data contract. Return that snapshot to the coordinator early so the template agent can use it.
- Prepare the smallest configuration diff while the template is being created. Do not upload or create a configuration until the exact template revision is ready and the publication authorization covers it.
- Use the [publication procedure](publication.md#publish-the-template-and-prepare-configuration) for the inactive copy, agreed uploaded or replaced file, and retained rollback state. Keep configuration values, including Unicode labels, intact when serializing and compare the parsed values after readback.
- Immediately before writing, recheck the source configuration against the snapshot. If it changed, return the difference for reconciliation; do not overwrite another person's changes.
- On an ambiguous write result, read back before retrying to avoid duplicate files/configurations. If identity or status remains ambiguous, stop writes and return the uncertainty.
- Perform an inactive-copy switch only under the [activation stage](publication.md#activate-and-verify), which uses the shared configuration procedure and verifies the sole active configuration and template reference. Follow its render-failure rollback offer; do not restore automatically.
- Return IDs, paths, parsed configuration differences, verification evidence, and rollback status to the coordinator.

## Validation agent

- Return a missing candidate identity to the coordinator.
- Review the candidate XML and configuration diff without editing them or changing account state. Return defects to their owning agent.
- Check field provenance, missing and repeated values, escaping, signatures, images, and the source rules in the NetSuite XML/BFO reference. Compare the actual NetSuite PDF with the accepted design when rendering or a user-supplied PDF is available. Check spacing, heading styles, page breaks, empty sections, and odd image counts.
- Tie each result to the XML revision and, for a live render, the account, report record, uploaded file, configuration, and render time. An old PDF or a file with the same name is not evidence for the candidate revision. When these cannot be established, state the uncertainty.
- Report source review and NetSuite render results separately as pass, fail, or unavailable. An HTML preview, byte-size match, or valid XML wrapper is not a render pass. Report what was actually inspected.

## Handoff record

The coordinator maintains a compact handoff record. A local record outside the reusable skill folder may contain report artifacts, the [field manifest](../../references/service-reports/account-discovery.md#field-manifest), revision hashes, and handoff status. Each worker returns only its assigned updates; the coordinator merges them. Include:

| Area | Required evidence |
| --- | --- |
| Scope | Account, report family/record, requested stage, accepted design, user authorization and exceptions |
| Original state | Active configuration ID/name/status, configuration snapshot or hash, original template file ID/path |
| Candidate | Revision, absolute XML path, byte size, SHA-256, field manifest, configuration diff |
| Published state | Uploaded or explicitly replaced file ID/path/size, content hash when readable, selected configuration ID/name/status and readback |
| Validation | Reviewed revision, source findings, PDF/render source and time, pass/fail/unavailable, unresolved limitations |
| Documentation | Relevant exact URLs from the report source index, check date, checked/unchecked status, and guidance affected by any unavailable page |
| Activation | Exact authorized target, final active-state readback, prior state for rollback, rollback result if used |

Keep account data and credentials out of shared skill assets. Record a metadata-only upload check as such if contents cannot be read. A matching filename or size alone does not prove content identity.

## Execution order

1. **Discover and draft:** Run account discovery and placeholder layout work independently. The coordinator opens the preview in the user-facing host's supported rendered viewer; a background worker's local preview is not sufficient evidence that the user can see it. Resolve the data contract before finalizing bindings.
2. **Prepare and review:** Collect the completed XML revision and proposed configuration diff. Have validation review them. Return defects to their owners and review changed areas again.
3. Publish: Once the exact action and revision are authorized, the configuration agent follows [publication](publication.md#publish-the-template-and-prepare-configuration) and reads back every affected object. A replacement authorization does not extend to later publications.
4. **Render when supported:** Validate the staged report if the host can safely render against the inactive configuration. Otherwise record the limitation; do not activate solely to inspect it. The user may authorize activation with this limitation disclosed.
5. **Activate and verify:** For a prepared inactive configuration, after authorization for the exact activation, the configuration agent performs the switch and checks the active state. Validate the live PDF immediately when supported. Report a failed render and offer rollback; report an unavailable render as unverified.

If the host cannot upload, render, or delegate, preserve the ready artifacts and identify the precise remaining action. Do not treat an agent completion message as proof of the resulting account state. A stale file, missing permission, or unavailable tool must not be hidden by spawning another agent.
