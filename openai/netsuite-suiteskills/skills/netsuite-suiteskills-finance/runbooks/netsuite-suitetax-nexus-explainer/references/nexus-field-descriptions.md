# Nexus-relevant Core Tax field descriptions

Use this reference only when a transaction-specific question requires the exact meaning of a tax-registration or Nexus field in a NetSuite screenshot, export, search result, or record view. It supplements the main nexus decision flow; it does not replace address sourcing, B2B/B2C classification, registration-validity, or fallback rules in `RUNBOOK.md`.

## Source and precedence

These curated field descriptions supplement the decision flow. Consult current public Oracle Help and the bundled answer policy for source precedence; field identifiers are candidates requiring current interface evidence.

## Subsidiary Tax Registration

Use these fields to establish whether the subsidiary has a matching and active registration for the candidate nexus.

| Field | Record ID | Meaning for nexus explanation |
| --- | --- | --- |
| Nexus | `nexus` | The tax jurisdiction for which the subsidiary is registered. |
| Effective From | `effectivefrom` | The first date on which that registration applies. |
| Valid Until | `validuntil` | The last date on which it applies; blank means no defined end date. |
| Country | `nexuscountry` | Country context of the registered nexus. |
| Tax Reg. Number | `taxregistrationnumber` | Subsidiary tax ID for that nexus; it identifies the registration but does not itself prove date validity. |
| Tax Engine | `taxengine` | Engine assigned to the registration. It does not change the automatic Core nexus decision tree. |
| Tax-Exempt | `istaxexempt` | Indicates the subsidiary's tax-exempt status for the registration. Do not confuse it with a customer exemption certificate. |

## Customer Tax Registration

Use these fields only to identify the customer's registered jurisdiction and number. For a sales nexus answer, a populated **selected Customer Tax Registration Number on the transaction** is the B2B input; follow the main skill for that rule.

| Field | Record ID | Meaning |
| --- | --- | --- |
| Nexus | `nexus` | Jurisdiction of the customer's registration. |
| Address | `address` | Address associated with that registration; it is not automatically the transaction Ship To source. |
| Tax Reg. Number | `taxregistrationnumber` | Customer tax ID associated with the registration. |
| Country | `nexuscountry` | Country of the registered jurisdiction. |
| State | `nexusstate` | Subnational context of the registered jurisdiction. |
| Customer | `entity` | Customer record that owns the registration. |

## Nexus record

| Field | Record ID | Meaning |
| --- | --- | --- |
| Country | `country` | Country scope of the tax jurisdiction. |
| State | `state` | State, province, city, county, or other locality that narrows the jurisdiction. |
| Description | `description` | Human-readable label that distinguishes the nexus from others. |
| Parent Nexus | `parentnexus` | Hierarchical parent of the nexus; do not use it as a substitute for an active registration. |
| Use Fulfillment to Modify Tax Point Date | `taxdatefromfulfillment` | Nexus setting related to tax timing. It does not replace the **Transaction Date** used by this skill for nexus-registration validity. |

## Boundaries

- This reference does not define the actual transaction Ship From or Ship To source. Use the main skill's address-source order.
- It does not define a final nexus from a displayed record field alone. Show the candidate, the subsidiary-registration validity check, any fallback, and the result.
- It does not make a tax registration number, a customer-registration address, or a parent nexus an implicit override.
- For Tax Point Date, Nexus Override, Multiple Shipping Routes, or transaction-level address field behavior not described here, use `RUNBOOK.md` and `transaction-inputs.md`; do not invent field semantics.
