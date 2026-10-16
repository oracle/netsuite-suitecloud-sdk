# Optional result evidence

Use this attachment when a selected runbook requests reproducible analytical checks, composition or a review view. It supplements the existing answer and evidence requirements; a simple supported answer does not require an attachment or additional questions. Existing producer, analyst, independent-review and financial-visualization gates remain authoritative. An absent helper/receipt cannot bypass those gates and does not invalidate otherwise supported facts.

The [schema](result-evidence.schema.json) identifies producer runbook/version, pinned foundation digest, actual observation time, scope, row grain, source locators, population coverage, rows, calculation lineage and separate domain-review evidence. Keep currency, accounting book, entity, period and units where relevant. Values use exact decimal strings or integers; null means unknown and explicit unavailable states remain distinct. Minimize sensitive data before creating an artifact. Do not repeat header totals on detail rows and sum them.

Use [result_evidence.py](../tools/result_evidence.py) to validate_result, digest_result, create_receipt and verify_receipt. A clean replay verifies binding, even when the receipt's status is failed or incomplete: inspect both. A passed receipt covers only its listed checks and does not authenticate sources, verify independent review, establish freshness, prove completeness or authorize an action. Record actual applicable checks and unresolved checks separately; an empty check set is incomplete.

Changes to data, source, observation, scope, calculation lineage, producer or foundation require a new receipt. Display sorting/pagination does not change the result. An analytical filter, aggregation or new calculation creates a new result and applicable checks. A visible display subset remains labelled against the original retrieved population and source coverage.

Ordinary responses retain their current format and status. If the optional helper cannot run, state only the affected mechanical checks as not_run when material; never label all source facts unverified solely for that reason. Missing mandatory analytical prerequisites retain their existing fallback.

See [calculation checks](CALCULATION-CHECKS.md) and [optional review view](../rendering/REVIEW-VIEW.md).
