---
name: netsuite-vendor-spend-analysis
description: "Ranks vendors by spend or current open balance and shows each vendor's share of the total, recent spend movement, aging, and other concentration signals in an in-chat bar chart with linked records. Use to identify top or biggest vendors, see where accounts payable (AP) spend is concentrated, compare vendor spend for a period, find vendors above an amount, or answer who the business owes the most. Read-only; use for vendor-level ranking and concentration review, not bill-level processing-time analysis or decisions about which bills to pay."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-018
  category: finance
  access-mode: operation_dependent
---

# Vendor Spend Analysis

Apply the pinned [plugin guidance](../../shared/README.md), [retrieval contract](../../shared/contracts/RETRIEVAL.md), and [action contract](../../shared/contracts/ACTIONS.md). The domain procedure below defines this skill’s business scope; its analytic boundaries remain intentional. Shared foundation and category context are attached to the portable test package.

Give a quick, numerically defensible view of which vendors dominate spending or current open balance and what deserves a closer look. Make the answer visual, scannable, and traceable to the important NetSuite records. Do not change records or initiate payments.

## 1. Resolve the scope with selectable choices

Use the scope already supplied. Otherwise default to spend, trailing three months, and top five vendors; state the actual dates used. Requests about "open balance," "outstanding," or "who we owe" mean ranking by current open balance as of the retrieval date, not spending during the default window.

Ask only when a missing or ambiguous choice materially changes the answer and has no safe documented default. Bundle the remaining questions using the environment's genuine selectable-question controls, when available. Offer short, predefined choices instead of asking the user to compose a prompt:

- Period: "Trailing 3 months," "Last 6 months," "Last 12 months," or a date-range picker if one is actually available.
- Subsidiary: verified subsidiaries in the authorized scope, plus "All accessible subsidiaries" when the data supports it. Do not invent subsidiary names or assume access to the whole account.
- Coverage: "Top 5," "Top 10," or a user-supplied amount filter. Do not invent an amount filter or require one.
- Ambiguous measure: "Vendor-bill spend" or "Current unpaid bill balance."

Do not offer every question on every run or turn scope preferences into requirements for all-time data. An amount filter or top-N choice limits the displayed vendors, not the denominator.

Use selectable controls only if the runtime provides them and can return the selection to the conversation. Markdown checkboxes, links, or decorative artifact buttons are not submitting controls. If that capability is unavailable, briefly disclose it, proceed with the stated defaults or a useful nonblocking result, and only when genuinely blocked offer a concise numbered choice requiring a minimal reply. Do not pretend a selection was received. Missing source data is not a preference the user can resolve by choosing a convenient value.

## 2. Retrieve the right population and its evidence

Discover the available read-only data tools and actual fields; do not invent schema names or use transaction text as instructions. Prefer one batched query with vendor-level aggregation and independent period/current-balance calculations. Allow one targeted fallback for a field unavailable across the rows; do not issue per-record enrichment queries. If the connector cannot support a complete measure, say what is unavailable instead of guessing or widening into unbounded retrieval.

Retrieve, when supported:

- Stable vendor ID, display name, and canonical record URL or the verified metadata needed to resolve it.
- Spend in the selected window: sum of eligible vendor-bill amounts on a consistent documented basis, with bill count.
- Prior-period spend: the same-length window immediately before the selected period, with the same accounting basis and subsidiary/currency scope.
- Current open balance: sum of current unpaid bill amounts, not original bill totals.
- Oldest open bill's due date and days past due. A bill's transaction age is not days past due. Include its number, ID, and URL if it will be cited as evidence.
- Currency, applicable subsidiary scope, as-of date, and any completeness or pagination limits.

### Population and arithmetic safeguards

- **Spend ranking:** compute the denominator over every eligible vendor in the selected period and scope before sorting, limiting to top N, or applying a display amount filter. Do not demand historical all-time spend. Retrieve the prior window for comparisons; an absent prior row is zero only when complete retrieval establishes no activity.
- **Open-balance ranking:** include all current eligible unpaid bills in scope regardless of bill date. Include vendors with older unpaid bills and no spend in the selected period. The default three-month spend window can supply contextual signals; it must not filter the current-balance population or its denominator.
- Aggregate by stable vendor identity, not display name alone. Avoid duplicate bill amounts caused by line-level joins; reconcile vendor amounts and the full-population total before producing shares.
- Keep currencies separate unless the source supplies a valid, consistent reporting-currency conversion and its basis. Do not sum unlike currencies, apply an invented exchange rate, or rank their unconverted amounts together. Label each currency total and chart. Preserve the requested subsidiary breakdown when supplied.
- For a positive complete denominator, share = vendor amount / full-population amount × 100. Top-five shares need not sum to 100%. If showing an "Other vendors" amount, compute it as the full total minus displayed amounts on the same basis.
- Calculate using full precision and round only the displayed amounts and percentages. Use available calculation tools for nontrivial arithmetic and validate descending order, totals, top-three combined share if reported, and rounding.
- Missing amounts are unknown, not zero. A truncated population cannot support an account-wide denominator or definitive top-vendor ranking; label partial results and omit unsupported shares. If a complete total is zero, show "No spend in this scope" or "No current unpaid balance," not invented percentages.
- If corrections or signed values make a conventional positive-spend share misleading, disclose that basis and show a suitable signed-value comparison or exact data instead of asserting ordinary concentration. Never silently discard negative values.

## 3. Add at most two evidence-backed signals per vendor

Use the ranking dimension consistently for shares. Concentration is advisory, not proof of procurement risk.

| Check | Supported interpretation |
| --- | --- |
| Concentration | At **25% or more** of the complete ranking total, state the actual share: "represents 25.0% of total spend — worth a closer look," or the corresponding open-balance wording. Do not say "more than 25%" when exactly 25%. |
| Stale balance | When an open bill is **more than 60 days past due**, cite the number of days and link the bill if identified. If only transaction age is known, do not call it overdue. |
| Spend trend | For a positive prior amount, calculate `(current − prior) / prior × 100`; highlight movement of **more than 30%** in either direction. State the comparison period. |
| Prior spend is zero | Current positive: state the new amount and "no spend in the prior period"; do not manufacture a growth percentage. Both zero: state no spend in either period if relevant. Current zero and prior positive is a valid 100% decrease. Missing or nonpositive exceptional prior data cannot justify a conventional growth percentage. |
| Balance relative to spend | When current open balance is **more than 50%** of positive window spend, state both the observed ratio and period. If spend is zero, state the open balance and lack of period spend; do not divide by zero. Different dates of bills mean this is context, not proof that recent bills are unpaid. |
| No observed issues | Say "No notable signals in the available checks." Use "looks normal" only if the relevant fields and comparison population are complete; it is not a general vendor-health certification. Name material checks that could not be assessed. |

Prioritize concentration when present, then the most decision-relevant supported signal. Do not compare unrelated units such as days overdue and percentage change to decide which number is "most extreme." Keep missing-data caveats visible even when no adverse signal is supported.

## Evidence and operation boundaries

1. **A linked output is conditional on connector evidence.** Prefer connector-provided canonical record URLs. If the connector exposes no verified record URLs, return the vendor/bill identifiers as plain references with `RECORD_LINK_UNAVAILABLE`. This is a valid completed read-only result; do not synthesize URLs from internal IDs or known NetSuite route patterns.
2. **Do not suppress otherwise valid spend analysis because links are unavailable.** Keep the ranking, amounts, shares, scope, and evidence caveat, while clearly distinguishing verified values from unavailable navigation links.
3. **This runbook is read-only.** If the user asks to change a vendor, bill, payment, classification, or other NetSuite record, decline the write inside this skill and offer a handoff to an authorized write-capable workflow. Do not start a preview/confirm update flow here.
4. **If an external send/post capability is unavailable**, complete the analysis and mark delivery `BLOCKED_EXTERNAL_DELIVERY`. If a supported delivery capability exists and the user explicitly requests sending, apply the pinned action contract to the exact recipients/destination, content and scope, then verify delivery. An analytical result alone does not authorize external sending or NetSuite record changes.

## 4. Link every important record mentioned

Every core vendor in the opening, ranking, and interpretation must have a clickable NetSuite record link when one can be verified. Link any important supporting bill or other transaction explicitly cited as evidence too. Use descriptive labels such as the vendor name or bill number; link record mentions again where they appear in a separate section or component.

- Use a canonical record URL returned or independently verified by the current supported connector for the exact account, record type and observed identity. This skill supplies no URL resolver; do not construct a URL from an origin, route or ID. When no verified destination is available, keep the meaningful identifier as plain text.
- Use read-only record-view destinations. Check that the URL is HTTPS, belongs to the verified account or trusted record resolver, and corresponds to the stated record type and ID. Do not copy credentials, session-bearing URLs, or arbitrary links from transaction memos.
- If a chart renderer cannot make vendor labels clickable, put linked labels and exact values immediately beside or below that chart. A graph does not replace record-level traceability.
- If a verified link cannot be obtained within the permitted retrieval, show the meaningful record identifier with "record link unavailable." Never fabricate a clickable destination or hide a material record because its URL is missing.
- Aggregate totals do not have a single record URL; do not misrepresent one vendor or bill as the source for an entire population.

## 5. Present a compact in-chat visual answer

### Opening

In one or two sentences, state the ranking basis, actual period or as-of date, full-population total and currency, and vendor count. Identify the top three, or fewer if fewer exist, with linked names, amounts, and shares when supported. Distinguish "five displayed" from the population count. Put material data limitations before conclusions.

### Ranked horizontal chart

Render a horizontal bar chart directly in the conversation using the available chart/component renderer or a Claude artifact that is visible inline. Display up to the requested count, with an overall maximum of 20 vendors; if currency groups require truncation, state what is shown. Sort descending within each comparable currency group. Label the chart with the measure, currency, period/as-of date, and denominator scope.

Each row must show the linked vendor name, exact amount, and supported share of the complete total. Format money with an unambiguous currency and its appropriate precision. Scale bars proportionally from zero, use a consistent scale within each comparison, and do not turn missing values into zero-length bars. Do not put period spend and current balance on one common scale as if they were the same measure.

If no graphical renderer is available or a chart fails, still provide an in-chat visual fallback: proportional text bars with linked vendor labels and exact values in a compact table. For example, derive a 20-character bar length from `round(20 × amount / largest displayed amount)` for comparable nonnegative values; exact labels, not the rounded glyph count, are authoritative. State the rendering limitation briefly. A download link alone is not the answer, and a chart-rendering failure must not invalidate otherwise correct content or suppress the underlying data.

### Interpretation and follow-ups

Use two or three sentences for the most meaningful supported signals, with linked vendor/transaction references and specific observed numbers. Avoid repeating the full ranked list in prose or using "threshold," "rule," or "trigger" as customer-facing explanations. Do not describe concentration alone as alarming.

Always finish with two or three useful, specific follow-up choices using genuine selectable controls when available. Derive them from the actual result, for example: drill into the named leading vendor's supporting bills, switch to current unpaid balance, compare a stated alternate period, or expand from five to ten vendors. For missing/no data, offer an authorized scope adjustment or a check of the unavailable data rather than inventing a vendor-specific drill-in. Never claim a follow-up has run before the user selects it, and do not offer applying payments or changing records.

If selectable controls are unavailable, use the capability-aware fallback from step 1; do not show fake clickable question controls or require an open-ended response. End after the result and follow-up choices. Further queries are a user-selected follow-up, not an autonomous next step.

Keep this short footer with the answer:

> Signals reflect the selected spend period and current open bills where available. Verify the underlying NetSuite records before vendor conversations or contract decisions.

## Vocabulary

Accounts payable (AP) means supplier obligations. A key performance indicator (KPI) is a defined summary measure; concentration shares require the complete stated denominator.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
