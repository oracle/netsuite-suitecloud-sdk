# Explanation and Evidence

Use this reference to turn retrieved pricing evidence into a concise, auditable answer without overstating certainty.

## Contents

- [Evidence hierarchy](#evidence-hierarchy)
- [Exact-price response](#exact-price-response)
- [Multiple-possibility response](#multiple-possibility-response)
- [Existing-transaction explanation](#existing-transaction-explanation)
- [Why a rule or path was selected](#why-a-rule-or-path-was-selected)
- [Discrepancy explanation](#discrepancy-explanation)
- [Safe wording](#safe-wording)
- [Manual verification paths](#manual-verification-paths)

## Evidence hierarchy

Use the strongest label the evidence supports, never the label the user hopes for.

| Label | Required evidence | Allowed claim |
| --- | --- | --- |
| Recorded assigned price | Exact transaction line with returned Rate and compatible context | "The line is assigned X." |
| Engine-confirmed source | Assigned line plus returned Pricing Details, applied rule, or verified source indicator | "NetSuite assigned X through source Y." |
| Engine-evaluated preview | Validated non-persisting native evaluation for the complete context | "NetSuite evaluated X for this context." |
| Configuration-resolved expected price | Complete, compatible, deterministic current configuration across every relevant hierarchy branch | "Current accessible configuration resolves to X; no transaction was priced." |
| Candidate values | Compatible stored paths but incomplete winner evidence | "These values remain possible." |
| Unresolved | Material context or evidence unavailable | "A single supported price cannot be determined yet." |

A recorded Rate can coexist with unresolved provenance. Do not weaken the confirmed Rate merely because the source field is unavailable, and do not strengthen the source explanation by matching the amount to current configuration.

When sources differ, an evidence label applies to each claim, not to the entire answer. A stored
line Rate answers what was recorded; an applicable current rule answers what the retrieved policy
or configuration could support for its verified scope; a prospective price requires its own
complete context and native evaluation or deterministic configuration resolution.

## Exact-price response

Use the shortest format that preserves provenance:

**Price:** `<amount> <currency> per <unit>` — `<evidence label>`

**Context:** Customer, Item, transaction type or number, pricing date, quantity context, currency, and subsidiary only when material.

**Why:** State the returned Price Level and source. If the source is reconstructed, name the hierarchy tier and the qualifying facts: rule/customer scope, item scope, date, currency, quantity, and tie-break preference where used.

**Other paths checked:** Include only higher-priority or conflicting alternatives that materially support the conclusion. State why each was unavailable, incompatible, or lower in the documented hierarchy.

**Limit:** State whether the result is stored on a transaction, a native preview, or reconstructed from current configuration. Keep discounts, tax, and totals separate.

## Multiple-possibility response

When no single price is supportable, do not bury the direct answer. Lead with:

> A single supported price cannot be determined from the available evidence.

Then use a compact table:

| Candidate source | Amount | Price Level | Currency / unit | Quantity context | Why it remains possible | Missing evidence |
| --- | ---: | --- | --- | --- | --- | --- |

Order candidates by the documented pricing hierarchy, not by amount. Keep equal amounts as separate rows when they have different provenance.

After the table, ask only for the smallest missing input that can distinguish the candidates. If the missing evidence is connector access rather than user context, say which path could not be verified and offer the NetSuite transaction Pricing Details view or another safe verification path.

## Existing-transaction explanation

For a saved transaction, distinguish three facts:

1. **Stored outcome**: the returned Rate, Price Level, currency, unit, quantity, and line amount.
2. **Returned provenance**: the applied Price Rule, pricing detail, customer-pricing path, base price, or manual/custom indicator actually exposed on the line.
3. **Current comparison**: current Price Rules and Item Prices, if retrieved for troubleshooting.

Never use current comparison data as proof of historical causation. Phrase it as "current configuration is consistent with" or "current configuration differs from," not "this caused the historical rate."

## Why a rule or path was selected

An explanation should identify evidence, not narrate unsupported engine internals. Depending on what was returned, useful reasons include:

- customer-specific Price Rule matched the Customer or its materialized group;
- the Item matched an explicit entry or materialized Item Collection;
- the transaction date fell within returned effective dates;
- the selected Price Level had a usable price in transaction currency;
- only a subsidiary-base-currency fallback was available;
- multiple same-tier candidates remained and the verified account preference selected highest or lowest;
- no higher-priority customer-specific path returned a complete viable price, so the documented fallback tier was used;
- the transaction line shows a Custom/manual source; or
- the line exposes base or general Item Pricing.

Do not say a path "did not exist" when it was inaccessible. Say it was not returned, not accessible, incomplete, or incompatible, according to the evidence.

## Discrepancy explanation

Lead with the observed difference, then separate:

| Label | Report | Keep unresolved when |
| --- | --- | --- |
| **Recorded price** | The exact stored line Rate, Price Level, currency, unit, quantity, and transaction date that were returned. | The line or material context is inaccessible. |
| **Policy/configuration** | The verified rule or pricing path, its value and effective scope, and whether it is historical evidence or only current configuration. | Applicability, history, priority, or source access is incomplete. |
| **Prospective result** | A separately evidenced native preview or configuration-resolved expectation for the complete requested context. | A material input, branch, or native evaluation is unavailable; list candidates if useful. |

If a recorded Rate differs from a current rule amount, show both with their distinct contexts.
Do not select either as the single "correct price" or claim the rule caused the stored Rate
without returned provenance or applicable historical evidence. Then explain:

- **Confirmed facts**: stored transaction Rate and returned context.
- **Supported cause**: only when a provenance field, manual/custom marker, changed configuration record with applicable history, or another direct source establishes it.
- **Diagnostic possibilities**: date, currency, base-currency fallback, quantity aggregate, unit, customer parentage, dynamic membership freshness, rule conflict preference, manual override, or configuration changed after the transaction.
- **Next check**: the one evidence source most likely to distinguish the remaining possibilities.

Do not recommend changing a rule or price as part of diagnosis.

## Safe wording

Prefer:

- "The transaction line is assigned..."
- "Pricing Details identifies..."
- "Current accessible configuration resolves to..."
- "This stored path is a candidate because..."
- "The winning path is unresolved because..."
- "No matching accessible row was returned for this exact scope."

Avoid:

- "The customer will pay..." when only a unit Rate is known.
- "This rule definitely won" without returned provenance or complete deterministic reconstruction.
- "Best estimate," "likely price," or "probably" as substitutes for evidence.
- "No rule exists" after a failed, inaccessible, capped, or partial request.
- "The system converted..." without a returned converted amount.
- "Quantity tier 1 means quantity 1."

## Manual verification paths

When connector evidence is incomplete, direct an authorized user to the narrowest relevant NetSuite surface:

- Existing sales line: open the transaction and inspect Rate, Price Level, and the Pricing Details summary when available.
- Customer pricing: Customer > Financial > Item Pricing, Group Pricing, and Price Level.
- Item pricing: Item > Sales/Pricing > pricing matrix, including currency, unit, and exact quantity columns.
- Price Rule: inspect status, dates, Price Level, customer/group scope, item/collection scope, and materialized membership.
- Conflict preference: Setup > Accounting > Accounting Preferences > Items/Transactions > Sales & Pricing.

Present these as verification steps, never as evidence already inspected by the connector.
