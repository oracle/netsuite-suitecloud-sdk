# Showcase Prompts - Vendor spend analysis

1. Rank the top vendors by spend for [period] and return verified vendor references even if the connector cannot provide clickable record URLs.
2. Show current open-balance concentration by vendor and label any unavailable navigation link `RECORD_LINK_UNAVAILABLE` instead of constructing one.
3. Compare vendor spend with the prior period, showing verified amounts, shares, and source scope without requiring record URLs for the analysis to succeed.
4. Identify stale or concentrated vendor exposure and cite supporting bill references only when the underlying records are verified.
5. If I ask you to change a vendor or payment from this analysis, keep the workflow read-only and offer the appropriate authorized handoff.
