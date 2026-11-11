# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Financial visual profile

Visual dataset: `VISUAL-2.0.0`; evidence runtime: `PM-4.0.0`.

Own monetary and policy semantics. Select the question's view; never add financial controls, forecasts or financial transaction scope.

Read [presentation](../presentation.md), [visual contract](../visual-contract.md) and the existing domain/evidence rules. Source completeness and request/risk gates precede rendering. Partial results retain an explicit incomplete/limited state.

## Recipe index

- [Approved budget and actual results](financial.md)
- [Billing eligibility and holds](financial.md)
- [Cash applications and aging](financial.md)
- [Commitments and realized cost](financial.md)
- [Revenue reconciliation](financial.md)
- [Expense-policy evidence](financial.md)
- [SOW commercial mapping](financial.md)

<a id="performance"></a>
## Approved budget and actual results

**Select:** Project/portfolio financial performance comparison.

**Required normalized evidence:** Natural-grain nonoverlapping money rows with project, currency, book, period, basis, kind, approval/posting evidence.

**Measures and definitions:** Posted cost − approved budget; recognized actual revenue − actual cost; margin percent only over positive compatible revenue.

**Layout:** Separate context panels; same-scale budget/cost paired bars, exact amounts, baseline/version evidence.

**Evidence detail:** Source lines, amount kind, grain, filters, approval/budget baseline and posting basis.

**Unavailable and semantic boundaries:** Separate currencies/books/periods; absent is not zero. Spending below total budget is not savings or acceptance.

**Handoff:** Financial owns money; Health consumes scoped results.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="billing"></a>
## Billing eligibility and holds

**Select:** Unbilled work or delayed invoicing investigation.

**Required normalized evidence:** Actual charge/project links, eligibility, documented rule/trigger, hold state, invoice links and aging clock.

**Measures and definitions:** Eligible unbilled amounts versus held/not eligible separately by monetary context.

**Layout:** State/amount table; bars only for complete compatible additive amount groups.

**Evidence detail:** Charge and invoice lineage, rule/trigger, required approvals, holds and source timestamps.

**Unavailable and semantic boundaries:** Unbilled is not leakage or debt; pending approval is not overdue without its time/SLA basis.

**Handoff:** Financial; Operations handles permitted follow-ups, analysis does not itself authorize financial execution.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="cash"></a>
## Cash applications and aging

**Select:** Outstanding project invoices or payment attribution.

**Required normalized evidence:** Verified project → invoice → application links; as-of balance history; separate deposit, application, credit and unapplied kinds.

**Measures and definitions:** Outstanding eligible balance and supported overdue unpaid amount; separate applied/unapplied funds.

**Layout:** Exact application/balance table; aging bars only with complete verified clocks and balances.

**Evidence detail:** Application keys, invoice links, credits/reversals and date cutoff.

**Unavailable and semantic boundaries:** No shared-customer inference, deposit-plus-application duplication or current balance treated as historical balance.

**Handoff:** Financial owns attribution; analysis does not itself authorize payment execution.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="procurement"></a>
## Commitments and realized cost

**Select:** Procurement commitments versus receipts, bills and costs.

**Required normalized evidence:** Verified order/receipt/bill/project links and separate approved/received/posted measures.

**Measures and definitions:** Keep commitments, received and posted actual distinct; disjoint residuals only if linkage proves them.

**Layout:** Order → receipt → bill linkage table, separate measure columns.

**Evidence detail:** Open/received/billed portions, line IDs, currency/book/period and matching limitations.

**Unavailable and semantic boundaries:** Never add overlapping order, receipt and bill amounts into a cost total.

**Handoff:** Financial analysis. A purchasing transaction requires a separate authorized request and applicable procedure under the shared action contract.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="revenue"></a>
## Revenue reconciliation

**Select:** Recognized revenue versus supported source detail.

**Required normalized evidence:** Recognition entries and linked source detail with matching currency/book/period/basis.

**Measures and definitions:** Recognized actual and independently supported unmatched amounts.

**Layout:** Reconciliation table; optional waterfall adapter only when every component reconciles.

**Evidence detail:** Posting entries, source links, differences and unmatched evidence.

**Unavailable and semantic boundaries:** Billings are not revenue; do not infer recognition or forecast from a SOW.

**Handoff:** Financial; Health uses verified actuals.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="policy"></a>
## Expense-policy evidence

**Select:** Review expense compliance exceptions.

**Required normalized evidence:** Effective policy version/scope plus full applicable employee/day or report population and native evaluation where returned.

**Measures and definitions:** Separate native-confirmed, complete-rule-computed, candidate and not-determinable outcomes.

**Layout:** Policy-result table with limit, amount, period, population and approval state.

**Evidence detail:** Rule effective date, complete contributing lines, calculation and native warning when observed.

**Unavailable and semantic boundaries:** Incomplete cumulative population cannot prove breach; approval is not compliance.

**Handoff:** Financial owns compliance; Operations may supply factual approval queues.

**Fallback:** Preserve the same ordered answers, scope, coverage, definitions and exact rows as Markdown tables. If a richer component is unsupported or misleading, use its table rather than invent a widget. Disclosure/filter/compare remain local; new underlying scope or time requires revalidation.

<a id="commercial"></a>
## Proposal handoff

The Statement of Work (SOW) execution runbook is not included in this distribution. Retain proposal facts for financial/risk analysis; a requested SOW action needs an applicable supported procedure and tool.

## Audience boundary
Before publishing, apply [account-neutrality-and-disclosure.md](../account-neutrality-and-disclosure.md) and [presentation-integration.md](../presentation-integration.md). Keep the protected evidence, source completeness and action state unchanged; do not serialize arbitrary properties or execute a presentation.

## Adaptive composition
Use [adaptive presentation](../adaptive-presentation.md) and [dashboard presets](../dashboard-presets.md).
The recipes above define semantics and required evidence, not a fixed page sequence.
Select narrative-review for suitable broad findings; PM portfolio remains a Portfolio
Health preset with specialist handoffs. No layout bypasses the source/request/risk,
financial, capacity, privacy or SOW gates. Show synthetic examples only as labeled examples.

## Required broad-review depth
Apply [review-depth](../review-depth.md) before summarizing. Use the actual domain
record/detail-report grain, not only parent totals, then the applicable requirement/investigation
checks. Keep native Indicators first for scoped project analysis. Explicitly identify
required stages unavailable after attempted alternatives. This profile selects visuals;
it cannot reduce the evidence sweep. Default broad output to HTML/artifact and state
why a table/text fallback was necessary. All permitted rows remain in audit detail.
