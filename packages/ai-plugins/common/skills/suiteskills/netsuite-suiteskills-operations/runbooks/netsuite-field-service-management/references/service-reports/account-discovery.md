# Account discovery and field provenance

For the report workflow and related reading, see [linked references](../../workflows/service-reports/index.md#linked-references).

Use the [report account-access rules](../../workflows/service-reports/index.md#netsuite-access). When record families or relationships need clarification, use the [data model](../data-model.md#work-and-service-concepts). Use [work management](../work-management.md#notifications-and-service-reports) for notification and report behavior and the [dictionary guide](../dictionary-guide.md) when looking up fields. These establish context; the selected report contract determines its available variables.

## Make one focused discovery pass

1. Identify the selected Field Service Configuration through the plugin and read its name, ID, status, and stored custom JSON. The stored JSON and the template reference read in step 2 establish explicit overrides and the saved file reference, but not inherited defaults or effective merged arrays; see [effective configuration](../configuration.md#effective-configuration). Use supported runtime or account-specific evidence, when available, to establish only the relevant effective route and report settings. Configuration Preview is optional, not a routine prerequisite; do not enable it, open the NetSuite UI, or activate a record merely to inspect it. If effective settings cannot be established, mark dependent route and report defaults and effective checks unverified.
2. Read only the relevant Task, Case, or Project Task service-report contents/data contract and current template reference. Retrieve the current XML through the plugin only when adapting its design, preserving compatibility, or replacing that exact file. If plugin file access is absent, do not use a direct file URL or browser download.
3. For configured mobile tabs, read only event fields needed by the ordered route rules and the selected tab definitions. Do not fetch every child record to make a placeholder preview.
4. Read Company Information and the applicable subsidiary through the plugin for company name, address, colours if configured, and logo. Resolve the logo that applies to the report. Retrieve that one logo only if the plugin can provide usable media. If it cannot, use a neutral local placeholder and mark account logo rendering unverified. Do not fetch logo bytes from a NetSuite URL with another tool.

## Resolve fields

Use plugin-provided configuration maps, record metadata, field descriptions, narrow record reads, and plugin SuiteQL to nominate and verify bindings. AI descriptions are semantic clues, not proof. Verify record type, script ID, join path, select label versus stored ID, cardinality, and empty-value behavior for each field used in XML. If the plugin lacks the needed metadata or record access, leave the binding unresolved.

## Field manifest

Keep a manifest beside the report artifacts:

| Report element | Report variable | Record / exact field or query | Join / task association | Type / cardinality | Repeat / condition | Evidence / source reference | Empty behavior / fallback |
| --- | --- | --- | --- | --- | --- | --- | --- |

Record strings, reference objects, and sequences distinctly. For Mobile-derived elements, retain the tab ID and label. State whether each empty field or repeated group keeps its label and reserved space or hides entirely; carry that choice into XML and PDF checks. Keep unresolved bindings visible. Preview values do not establish NetSuite bindings.

In a saved manifest, keep field mappings and source references.

Use realistic placeholder values in local HTML by default. A Task ID may select mobile tabs without making the HTML a data-filled Task preview. If the user explicitly requests live Task values, fetch only the selected Task and related visible fields through the plugin. Retrieve Task media only when requested and available through the plugin. Keep customer sample values out of reusable skill assets.
