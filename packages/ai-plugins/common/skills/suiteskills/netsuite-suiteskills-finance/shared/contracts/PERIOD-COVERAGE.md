# Posting-period completeness

Use this guidance when missing period assignments could change a period-filtered conclusion, particularly close analysis. It is not a prerequisite for unrelated record lookups.

Check assignment coverage over the relevant candidate population, with the same subsidiary, book, currency, role and business predicates. An appropriate report, search or metadata-supported query may establish it. Use the selected runbook's coverage assets when available and applicable; a missing packaged query is not a reason to abandon supported discovery. Do not silently widen scope or treat a capped sample as the complete population.

## Optional bundled helper

`period_coverage.py` evaluates supplied aggregate evidence; it does not retrieve records or certify a clean close. Its current interface supports separate AR/AP and journal inputs. Use another supported calculation for other record populations while preserving coverage and reconciliation.

Call `python3 /installed/plugin/shared/tools/period_coverage.py /work/request.json`, replacing illustrative paths with actual absolute paths. Its request fields are: period_id (positive integer), expected_types (["CustInvc","VendBill"] or ["Journal"]), complete, scope_matches, metadata_verified (booleans), and rows with type, candidate_count, assigned_count, missing_count, selected_period_count (nonnegative integers). Follow these types when using this helper. Normalize counts losslessly; never round or convert null to zero. Keep working files outside installed plugin files.

## Interpretation

Missing posting periods limit a complete period conclusion even when the filtered result is empty. They do not establish that those transactions belong to the selected period. Zero candidates differs from missing assignments. Complete assignment coverage does not establish that all other close controls passed. Do not extrapolate an invoice-only check to bills, journals or all transactions.

A null display label alone does not establish a missing raw assignment or its cause. Do not infer posting period from transaction date. Preserve unknowns in text and artifacts, and describe actual coverage clearly.
