# Report selection and scope

Read only when selecting or interpreting a report. Routine workload queries do not require this file. Record fields, calculations and [completion/coverage rules](data-model.md#completion-coverage-and-history) remain in the data model.

Saved-statement reports cannot supply current matching queues. Some `ns_runReport` interfaces return summary-line values with no account/statement selectors. A current contract or valid finding that rules out required scope/detail permits skipping catalog discovery and execution unless independently mandated. Missing selectors alone do not rule out a verified account-specific fixed report or account-identified output. For an uncertain plausible candidate, perform required catalog/helper calls and run it once with supported parameters. `ns_listAllReports` precedes `ns_runReport`; report IDs/configuration are not portable. Do not invent filters or modify reports/searches.

| Source | Evidence and scope |
| --- | --- |
| Reconciliation History | Completed saved statements within verified account/history-date scope; excludes merely cleared items. |
| Reconciliation Summary / Detail | Selected reconciliation balances/difference or activity, bound to account and statement/cutoff. Require prior reconciliation and can include cleared-but-unreconciled items; titles do not guarantee returned detail. |
| Bank Register | Bank-ledger activity on verified account/date scope; credit-card coverage, inventory completeness and current balances are not implied. |
| GL / Trial Balance / Balance Sheet | Activity or balances for tie-outs only on verified account, subsidiary, date/period, currency and book scope. |

Native reconciliation reports use dates, not accounting periods. Account evidence needs returned identity or verified fixed configuration binding account, statement/cutoff, currency and book. `dateTo`, equal totals, the only nonzero account or a separate balance lookup cannot supply that binding. Cleared totals are not matching counts. Empty results establish absence only for verified complete scope.

Retain supported facts and pursue missing required facts through capable permitted searches, records or approved SuiteQL. Do not trial report families sharing a known limitation. Refresh capability findings after relevant connector/account/role/configuration changes; timeouts do not prove unsupported capability. Required inaccessible facts stay Unknown and limit the conclusion.
