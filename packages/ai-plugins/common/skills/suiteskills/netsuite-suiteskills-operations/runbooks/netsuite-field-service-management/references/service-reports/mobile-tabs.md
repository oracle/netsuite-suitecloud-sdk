# Translating configured FSM Mobile tabs

For the report workflow and related reading, see [linked references](../../workflows/service-reports/index.md#linked-references).

Read the customer's effective `routes/mobile` configuration through the NetSuite plugin and only the selected event fields needed for route matching. Use [effective configuration](../configuration.md#effective-configuration) and the shared [resource-rule selection](../configuration.md#searches-mapping-and-request-diagnosis) for merged settings and ordered matching. A mobile element may be display logic rather than a persisted NetSuite field. Read the [mobile elements reference](source-index.md#mobile-tabs) when relying on its element behavior.

## Select tabs with few account reads

- For a Task ID, read the minimum project/case/task/asset type values used by the ordered route rules. Resolve the matching rule and selected tab IDs, labels, order, and child resources from the merged configuration. If a rule or conditional tab remains ambiguous, use an additional narrow plugin read or mark the selection uncertain; do not open the NetSuite mobile UI.
- For a supplied project/case/task-type combination, evaluate it against the ordered rules and disclose other required event values.
- For an explicit tab list, resolve those IDs in the merged configuration and report missing IDs or conditions that cannot be evaluated.
- For an inactive configuration ID, use the stored configuration and read-only effective preview if exposed by the plugin; never activate it or open the NetSuite UI merely to inspect it.

## Map content

Read each selected tab's record type, filters, parent link, explicit `article.map`, repeated child elements, and form fields. Use the [resource mapping and automap contract](../fsm-mobile-resource-properties-reference.md#automap) for automatic mapping and explicit-map precedence, and check its relevant [source entry](source-index.md#mobile-tabs). Do not infer fields from similar labels.

Classify saved scalar fields, selects, dates, signatures, images, files, child records, computed display values, controls, and unsynced drafts. Build local HTML sections with placeholder rows and images from this structure. Fetch actual related rows only when a data-filled preview is requested or a binding is unclear.

Record each included element in the [field manifest](account-discovery.md#field-manifest) and verify field IDs before XML binding. If the mobile tab uses a remote aggregate that the report data contract cannot supply, keep the HTML placeholder, mark the XML binding unresolved, and do not invent synchronization.
