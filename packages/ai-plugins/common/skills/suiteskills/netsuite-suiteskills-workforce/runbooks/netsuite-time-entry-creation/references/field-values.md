# Field and reference resolution

The [generated field guide](timebill-field-guide.md) is a SuitePeople metadata snapshot, not a live create contract. For the selected account and role, call current `ns_getRecordTypeMetadata('timebill')` and `ns_getSuiteQLMetadata('timebill')` before using field names or writing SuiteQL. Inspect an active Time Entry form/configuration only if the connector exposes it. A REST field's presence is **schema exposure**, not proof of create writability, requiredness, or reference eligibility. A missing required list and `nullable` flag do not make a field optional. Do not create to test requiredness.

Track four independent facts for each relevant field: (1) schema `exposed / absent / unknown`; (2) create writability `verified / unsupported / unknown`; (3) requiredness `required / optional / unknown / not applicable` and its evidence source; (4) option source and `field-verified / candidate / unverified` eligibility. Form settings establish requiredness; context-aware field options establish eligibility. The present Standard Tools connector exposes neither active-form settings nor `selectOptions`; detect future tools independently and never invoke an unexposed raw HTTP endpoint. Report “schema exposed; create writability and form requirement unknown” when that is what evidence supports. A verified required but unsupported field blocks Save.

## Bounded reference lookup

Use metadata-backed SuiteQL or permitted saved searches with a small page size and narrow predicates. Filter employee searches by the user's supplied name/email and active state if available. For non-employee references, scope by established target subsidiary and customer/project; page only the relevant result set. Do not enumerate account-wide customers, items, or employees to offer choices. Escape user text as SQL string data according to the connector contract; do not copy it into an unquoted SQL fragment. Match exact ID or unambiguous readable name, show `Name (ID)`, and ask to disambiguate multiple candidates. An empty **accessible** result differs from a denied lookup. For non-Service Item references, if permitted label paths fail, ask for an exact administrator-provided name and ID, mark it unverified, and disclose that NetSuite may reject the Save attempt. Use the Service Item-specific ID fallback below for `timebill.item`.

A selector “opened” result is not a selected record. SuiteQL record lists and static enums are candidates; only field-specific context-aware options verify eligibility. Refresh options when employee/subsidiary, customer/project, or another parent changes. A customer/project requires a service item under the time-entry rule. A service item also requires customer/project according to the SuiteQL field description. Keep an unresolved dependent field in a Needs clarification row rather than skipping the table.

## Service Item from a selected project

Preserve a Service Item the user explicitly named or selected in the current draft; do not replace it with a project default. When the row has a selected **project** and no explicit item, first inspect that project's current `jobItem` Billing Item through a permitted, exact-project read or a metadata-backed `job` SuiteQL query. SuitePeople `job` metadata exposes `jobItem` as a REST reference with `id` and `refName`; SuiteQL labels it **Billing Item** and describes the service item for billed transactions. Resolve a readable name and exact internal ID. Propose that value first, but do not assume a project Billing Item is assignable to `timebill.item`: verify active state and context-aware field eligibility when accessible. If only the project reference is readable, mark it **candidate / eligibility unverified** in the draft and final table and disclose that NetSuite may reject it. A changed project invalidates a previously proposed default or item selection unless the user's explicit item is revalidated for the new project.

If the selected project has no Billing Item, its value cannot be read, or that candidate is not usable, look for possible Service Items through whichever permission-scoped record metadata, search, or selector path the selected account actually exposes. Limit choices by known project/customer, subsidiary, active state, and item type when the live schema permits those filters. Do not invent an `item` or `serviceitem` SuiteQL schema: both metadata requests returned 404 `NONEXISTENT_ID` in the saved SuitePeople evidence, and a prior Items saved search was denied. A 404 or denied list is an access/tooling gap, not proof that no Service Item exists.

If a permitted Service Item lookup is denied, tell the user: **“If you know the Service Item internal ID, please provide it; otherwise ask an administrator for the ID or lookup access.”** Do not require an ID the user does not know. Without a selected Billing Item or another exact item ID, keep the row **Needs clarification** and do not offer Save. For a user-provided ID, attempt a permitted exact record/field check; if denied, retain the ID as **unverified**. If no readable label is available, display `Service Item ID 280 (unverified)` rather than inventing a name; do not require a name in addition to the exact ID. Show the risk in the draft and exact final review. NetSuite may accept or reject that separately authorized create.

## Location

Discover Location in the same pass as other fields. Establish the target employee's subsidiary first; for delegated entry use the **target's**, not the acting user's. Check `timebill.location` exposure, create writability evidence, active-form requiredness, current/default value, and scoped candidates separately. Never infer the work location from subsidiary or auto-select a lone candidate.

If the selected role exposes `LocationSubsidiaryMap` and `Location` in SuiteQL metadata, use an exact subsidiary association and active Location filter, bounded by the target's validated subsidiary ID:

```sql
SELECT l.id, l.name
FROM location l, LocationSubsidiaryMap m
WHERE l.id = m.location
  AND m.subsidiary = :target_subsidiary
  AND l.isInactive = 'F'
```

Adapt bind syntax to the live tool. A successful empty map means no mapped candidate, not permission to broaden. If the map is unavailable without denial, use only an independently supported bounded Location lookup with explicit whole-ID subsidiary associations. On denial, stop the affected read and establish its exact scope before considering an alternative. An underlying Location, subsidiary-association or population denial must not be bypassed through another transport or a user-provided ID; unclear denial scope blocks the dependent lookup and create validation. Otherwise show no choices and the administrator path. Do not infer “Include Children” eligibility. The associated active `Name (ID)` is a **candidate**, not field-verified. A current/default location must pass the same check before suggesting it. A target/subsidiary change invalidates the candidate and selection. Keep Location's selected, not selected, unsupported, not applicable, or unknown-requiredness status visible in draft and final review, even if absent from the payload.

The repository's evaluation-only Location helper documents exact-ID filtering; it is not required at runtime and is not packaged.

## Denial scope and create readiness

An unavailable lookup or label is distinct from denial of the underlying reference, population or create operation. An administrator-supplied ID does not override a denial. Resolve unclear denial scope before the dependent action. The supported create interface and writable payload fields must be established before Save; unknown active-form requiredness may remain explicitly disclosed only when the supported create contract permits that payload. Never create to test permissions or discover writability.
