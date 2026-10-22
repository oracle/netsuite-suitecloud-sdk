# Cash and Liquidity changelog

## Included in SuiteSkills 1.0.0

Component version: 1.0.1. Source version: 1.0.1.

When net cash flow is positive or zero, report that burn-based runway is not applicable rather than calculating negative or infinite runway. If verified inputs exist, report unrestricted cash divided by comparable monthly operating expense as coverage, with its period and limitations; zero or unknown expense makes this ratio unavailable. For receivable/payable timing, amountunpaid is a candidate field only after metadata and currency/sign/grain verification. Use an authoritative aging source when available. Separate current unpaid balances from historical as-of positions; do not substitute a familiar remaining-balance field after an error.
