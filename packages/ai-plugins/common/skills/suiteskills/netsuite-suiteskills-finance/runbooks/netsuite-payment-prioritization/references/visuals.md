# Cash allocation and cap previews

Use an available inline visualization tool after reading its tool instructions.
If unavailable, use a native chart or a self-contained artifact supported by the
host; a text/table answer is a valid fallback. Do not assume `show_widget`,
`chart_display_v0`, or `sendPrompt` exists. Keep visuals useful and compact: one
cash allocation view, plus a cap preview when a constraint comparison helps.

The response text remains the source for account/date, totals, rules, coverage,
and selected/excluded records. A visual must use the same retrieved snapshot and
allocation algorithm. Never embed sample vendors or placeholder amounts as live
data. Label color with words and include currency and readable numeric values.

## Cash view

Show verified balance (with its source), proposed cash, proposed offsets and
balance remaining. If balance is unavailable, show only proposed cash by tier;
label cap-only calculations as simulations. Do not display a fabricated balance.

With a verified balance B, reserve R, and selected cash P:

- Bank balance remaining is B − P, which **includes** the reserve.
- A stacked bar may show reserve R + payment tiers totaling P + unallocated
  balance B − R − P. These segments sum to B without double-counting reserve.
- Under a cap C, unused budget is min(B − R, C) − P. This is different from bank
  balance remaining. Show separate labels if both matter.
- Offsets reduce the payable, not the bank balance; do not add them to cash.

## Interactive cap preview

Embed the complete eligible candidate snapshot, compatible negative offsets,
priority order, reserve, balance, currency precision and explicit partial policy.
Recompute usable cash as max(0, min(B − R, slider cap)); the slider must not bypass
reserve or balance. A higher cap cannot select a held, rejected, currency-ineligible,
wrong-subsidiary or excluded-payee obligation. Partial allocations are off by default.

Use integer minor units or decimal arithmetic appropriate to the currency.
Display selected, partial, offset-only, and excluded states accurately. Zero cash
must remain zero; avoid truthiness expressions such as `pay || net`.

Label it “What-if using the retrieved snapshot.” Changes do not apply credits,
create payments, or refresh NetSuite. A supported follow-up button may request a
new read-only proposal, carrying account, payment date, filters, reserve, currency
and partial policy. Otherwise show copyable follow-up text. Do not silently call
an external API or embed credentials/connector URLs in a dashboard.

If coverage is incomplete, do not imply the preview models the entire account.
For a timing-only request, a due-date chart may replace the cap preview; keep the
table and exact discount dates/amounts in response text.

For mixed payable types, retain transaction type, payee type and line/installment
identity in drilldowns. Distinguish document counts from payable-unit counts.
For multiple native currencies, use verified converted account-currency cash in
the cash view; show native offsets separately and retain rates/rounding. A slider
must not guess FX or combine incompatible application groups. A zero-total preview
is analytical, not a valid Payment Run to save.
