Before tool use, load and apply [category SafeWords](../../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Publish and activate service reports

Read the requested stage only and use [report access rules](index.md#netsuite-access). Publication and activation are distinct authorized actions tied to exact revisions.

## Publish the template and prepare configuration

Use [account discovery](../../references/service-reports/account-discovery.md) to verify the selected configuration and report contract. Start from prepared XML with its field mappings, validation evidence, and any configuration diff. When preparation is still needed, use [new-design XML preparation](template.md#prepare-xml-from-an-accepted-design) or [existing XML editing](template.md#edit-existing-xml). An already prepared artifact needs no new edit or HTML conversion. Reuse authorization for the same exact action and revision; obtain a decision when absent or when the target or revision changes.

### Prepare the exact change

Resolve the File Cabinet destination from the selected account, configuration and template path, or the user's chosen folder. Verify its path, ID, permissions, and bundle lock state. Do not assume a fixed bundle folder or silently substitute a destination.

Identify the original file ID and path, preserve its contents and hash when MCP permits, and check whether the active configuration references it. Default to a new upload with a unique name; verify no file with that name exists in the destination and retain the original. An explicit replacement applies only to the identified file and revision. Replacing a file referenced by an active configuration affects that report without a separate configuration activation; include this effect in the authorized publication. The configuration must reference the agreed file path.

Finish the XML, affected mappings, validation, and configuration diff, including accepted HTML for the new-design route. Present the account; current configuration name, ID and status; report type and current template reference; proposed file name, path and new-file or replacement method; original file ID and path; unresolved bindings; and rollback values. A local preview is not a NetSuite PDF render.

### Publish and verify

For a required configuration change, use [configuration preparation](../configuration.md#prepare-an-authorized-change). Create a new inactive record named `<current name>_servicereport`, copied from the selected current configuration. Resolve a name collision before creating another record. Apply only the template reference and required data-definition changes, retaining unrelated settings and the current configuration.

After authorization for the exact revision, upload the agreed new XML or replace only the specified file, and follow [candidate creation and verification](../configuration.md#create-and-verify-an-inactive-candidate) only if a configuration change is needed. Read back every affected object. For an inactive copy, read its complete saved JSON and intended template path through MCP without activating it. Apply [configuration evidence review](../configuration.md#review-configuration-evidence) for changes depending on effective settings. Runtime evidence or an available user-provided Preview excerpt may establish what saved JSON cannot; do not routinely enable or request Preview. Missing effective evidence leaves dependent checks unverified; saved JSON alone does not establish publication success.

When MCP safely supports rendering against an inactive configuration, verify a representative Task without activating it. Do not send a notification email.

Record the candidate revision, XML byte size and SHA-256, uploaded file ID/path, and configuration ID. Verify uploaded content identity when MCP can read contents; otherwise label the check metadata-only. Filename or size alone does not prove the uploaded content. In delegated work, the configuration agent writes and the coordinator maintains the [handoff](coordinate-agents.md#handoff-record).

Report file path/ID, configuration name/ID/status, and render or effective-settings limitations. Proceed from an inactive configuration to [activation](#activate-and-verify) only when the exact switch is authorized. Ask for an activation decision only when activation is part of the user's request and the exact switch is not yet authorized. If MCP cannot upload, create, verify an affected object, or establish effective settings required by the change, stop that dependent step and provide the ready artifact and precise remaining action. Do not claim unverified publication is complete.

## Activate and verify

Use this stage only for a requested activation of a prepared inactive Field Service Configuration. Through MCP, read the target and current active configurations, their report file references, and publication's file/configuration IDs. When publication or readback is missing, complete that stage first; any missing upload or configuration creation requires its own exact publication authorization. An activation request alone does not authorize those writes. Match the target to the candidate revision and publication evidence; reconcile changed files or configurations because approvals and render results apply only to their identified revisions. In delegated work, the configuration agent owns status changes and rollback, and validation inspects the render.

Present the exact target and effect on the current active configuration. Retain prior configuration and file details for rollback. Reuse authorization for this exact activation and revision; obtain it when absent or changed. Follow the [versioned activation procedure](../configuration.md#establish-and-use-mcp-activation-for-a-versioned-change), including its pre-switch reads, candidate-first activation, old-record inactivation, and interrupted-switch recovery. Verify the intended configuration is the only active Field Service Configuration and references the agreed template file.

Immediately render a representative report through the selected FSM path when MCP supports it. Inspect actual PDF data, page breaks, fonts, logos, and conditional content under the [render validation rules](../../references/service-reports/netsuite-xml-bfo.md#validation-gates). Local HTML or an XML wrapper check cannot establish this result. If rendering fails, report it and offer to restore the prior active configuration through the approved configuration procedure; do not restore automatically. Retain original and revised XML for diagnosis and rollback, including readable original contents retained during an explicit replacement. If rollback or rendering is unavailable, report the exact unverified state and remaining action.

Report active configuration, template reference, render result, and any rollback performed. Do not send a notification email for verification.
