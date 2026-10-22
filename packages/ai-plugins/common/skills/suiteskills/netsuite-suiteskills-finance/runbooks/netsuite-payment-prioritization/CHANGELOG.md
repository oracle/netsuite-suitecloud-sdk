# Payment Prioritization changelog

## Included in SuiteSkills 1.0.0

Component version: 0.2.9. Source version: 0.2.9.

Filter GL-derived balances to the verified requested accounting book, defaulting to the established primary book when unspecified. Rank the complete eligible set with a stable final ORDER BY and supported pageSize/pageIndex; do not wrap ordered rows in ROWNUM on connectors that reject that shape. Preserve ties, currency groups and blocked-item reasons. Verify whether an unpaid amount is current or as-of before using it in a dated payment position.
