Before tool use, load and apply [category SafeWords](../../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# FSM service reports

For a new design, build a locally editable HTML report and translate the accepted design into NetSuite FreeMarker/BFO XML with verified field bindings. For a change to an existing report, use the current XML as the source for a revised copy and preserve unaffected behavior. The initial target is a CRM Task service report; check the distinct data contract before adapting one for a Case or Project Task. Never require an FSM source checkout or internal engineering documentation.

## NetSuite access

Use the **NetSuite plugin as the only connection to the NetSuite account** for configuration, records, metadata, SuiteQL, File Cabinet files, logos, report rendering, publication, and activation. Do not use a NetSuite browser session, direct HTTP/REST calls, shell network requests, or another connector to obtain or change account data. Use local file and rendering tools only to create/edit HTML and XML, validate them, and show an illustrative local preview when available; the local browser must not navigate to NetSuite. If the plugin cannot perform an account read or action, state that limit and continue only with work that does not depend on it.

## Linked references

Read the linked skill references for the requested mode and follow the [report source policy](../../references/service-reports/source-index.md#source-policy) for relevant external documentation and checked/unchecked handoff status. 

In these workflows, “NetSuite plugin” means the authenticated NetSuite MCP connection selected in the current host, whether exposed as a plugin or connector. Explicit user-authorized exceptions apply only within their stated scope and must be included in delegated instructions.

## Choose the workflow

| Request | Procedure |
| --- | --- |
| Change an existing report's XML while retaining its current behavior | [Edit existing XML](template.md#edit-existing-xml) |
| Create, convert, rebrand, or revise a local report preview | [Draft and revise the preview](template.md#draft-or-revise-an-html-preview) |
| Turn an accepted new design into verified NetSuite XML | [Prepare the template](template.md#prepare-xml-from-an-accepted-design) |
| Publish the XML and prepare the authorized configuration change | [Publish the report](publication.md#publish-the-template-and-prepare-configuration) |
| Activate a prepared configuration and verify the live report | [Activate the report](publication.md#activate-and-verify) |

Follow the relevant procedures in order when a request spans multiple outcomes; the direct-XML route does not require an HTML stage. Read only the requested mode or stage section and its applicable references; other modes in the same file are independent. Keep the applicable source design or XML, field manifest, configuration changes, and verification results available for the next stage.

## Coordinated agents

For work spanning template creation and account configuration, delegate independent work to a template agent and a configuration agent when subagents are available. Use a validation agent to review the completed artifacts and actual PDF when available. Keep the main agent as coordinator. Follow [agent coordination](coordinate-agents.md) for ownership, handoffs, and sequencing. Keep a small single-purpose request with one agent; if delegation is unavailable, follow the same stages sequentially and report that limitation.

Use host-supported delegation only when available. The role workflow supplies ownership and handoffs; it does not register agents or install a connector.

## Boundaries

- Do not create an application, Suitelet, background synchronization, or automatic coupling between mobile tabs and reports.
- Do not send a notification email while previewing. Do not upload a report or create a configuration record until the user has authorized the exact proposed publication. Reuse authorization already given for that action and revision; preparation alone authorizes neither publication nor activation.
- Follow [publication](publication.md#publish-the-template-and-prepare-configuration) for a new file and inactive configuration, explicit file replacement, and revision-specific verification. Publication does not itself authorize activation. Follow [activation](publication.md#activate-and-verify) for the exact authorized switch and post-render rollback decision.
- Keep customer data out of reusable skill assets. Preserve account access controls for logos and other File Cabinet content.
