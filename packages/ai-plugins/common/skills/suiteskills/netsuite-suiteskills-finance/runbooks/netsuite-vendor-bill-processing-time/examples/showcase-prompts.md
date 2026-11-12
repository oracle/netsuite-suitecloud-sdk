# Showcase Prompts - Vendor bill processing time

1. Measure vendor bill processing time for [period] and first report how many eligible bills have verified payment/application links.
2. Compare first cash payment versus final settlement only for bills with verified lifecycle relationships and disclose coverage of the full cohort.
3. Calculate days-to-pay for the verified linked subset and mark the overall result `PAYMENT_LINK_COVERAGE_INCOMPLETE` when links are sparse.
4. Show which bills cannot support a settlement-time metric because payment/application evidence is missing, without treating missing links as zero days.
5. If I ask you to approve or pay one of these bills, keep this workflow read-only and offer an authorized handoff instead.
