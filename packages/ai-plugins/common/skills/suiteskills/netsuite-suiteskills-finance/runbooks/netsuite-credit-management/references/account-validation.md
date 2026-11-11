# Account and connector validation

Use this reference when first applying the skill to an account or when a field, feature, permission, or read path is uncertain. Record only what the connected role verifies now; one test account does not establish a universal NetSuite rule.

## Capability inventory

Inspect the current connector tools and read permissions for customer metadata, paginated customer reads, direct record reads, reports, and account/session preferences. Do not claim a tool is available merely because NetSuite supports it generally. An unavailable tool, missing field, and permission denial are different findings.

Confirm the customer identity and currency fields, the meaning and nullability of the credit limit, the balance and signed aging fields, active/person/stage labels, subsidiary access, and parent/child relationships. SuiteQL and direct customer-record metadata are separate surfaces: an unknown SuiteQL identifier does not establish that a direct record field is unavailable. Verify order-inclusive credit-limit handling before describing enforcement-level exceptions. Verify the exchange-rate table, direction, effective date, and applicable organizational context before any report-currency comparison.

Check current session context first and distinguish features from accounting preferences:

- **Features:** use explicit current feature flags or a list documented as enabled features for this account. Map `CONSOLPAYMENTS` to **Consolidated Payments** and `MULTICURRENCY` to **Multiple Currencies**. A feature catalog is not proof of enablement; absence from a partial or undocumented list is unknown, not disabled. If session context cannot establish the state, use an available read-only feature-state capability or a verified Enable Features setting; otherwise state that the feature is unverified. Do not query `CompanyPreference` for Consolidated Payments or treat a same-named preference result as a conflicting feature flag. Populated consolidated-balance fields alone are not proof. If two verified current feature-state sources disagree, disclose that genuine conflict and withhold a consolidated enforcement conclusion.
- **Accounting preferences:** inspect the session's **Customer Credit Limit Includes Orders** (`CUSTCREDLIMORDERS`) and **Customer Credit Limit Handling** (`CUSTCREDLIMHANDLING`) values, and verify them through `CompanyPreference` when available. Preserve the source and account/role scope of each value; disclose unresolved disagreement rather than silently choosing one.

Oracle documents [feature enablement](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296530135.html) separately from [configuration preferences](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N3251359.html).

## Failure interpretation

- **Permission denied:** name the unavailable operation or field; give only the narrower supported result.
- **Connector limitation:** state which current tool path is absent; do not infer that the account lacks the feature.
- **Metadata failure:** follow the pinned readiness contract. Stop metadata-dependent queries when required schema is unavailable or denied; use only independently supported record reads, never guessed trial SQL.
- **Empty result:** state the exact accessible filters and scope; do not generalize to the whole account.
- **Incomplete page set:** withhold population-wide counts and totals or label them partial.
- **Ambiguous customer:** show minimum disambiguating context and ask the user to choose before reading or changing a record.
- **Unexpected field combination:** preserve the returned values and state that source interpretation needs verification; do not assign an unsupported cause.

Use explicit selected fields, connector-supported pagination, and narrow record reads. Do not retry a deterministic permission or schema error repeatedly or switch to a weaker source without labeling the downgrade.

## Release evidence to collect outside the skill

Keep account-specific observations in testing notes, not runtime instructions. Test: complete population pagination; blank versus explicit-zero limit; same-currency math; signed positive and negative aging; active/company/Customer-stage filtering; a parent/child account; an unbilled-order preference; a compatible and incompatible FX rate; and read-only handoff for credit-limit change requests, including a request that claims an earlier preview was confirmed. Treat unavailable branches as untested.
