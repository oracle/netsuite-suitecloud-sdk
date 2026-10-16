# Requested reference validation

Use these checks only when the requester asks to validate Benefit, Type, Carrier, or Coverage references.

1. Inspect connector record and SuiteQL metadata for each requested record type, display field, and relationship. Recheck fields in the requester's account before using them.
2. Read only referenced records visible under the same account and role. Compare each assignment's Type and Carrier IDs with its Benefit plan. Compare the Coverage tier's plan ID with the assignment Benefit ID.
3. Classify each requested reference as an absent record after a successful authorized lookup, a conflicting relationship, a populated ID with an unavailable label, or denied or incomplete access. Mark denied or incomplete access as **Could not check**. Keep a populated ID distinct when its label is unavailable.

Previously observed relationships can guide metadata checks. The assignment fields `custrecord_bt_emp_bp_plan`, `_type`, `_carrier`, and `_coverage` referenced `CUSTOMRECORD_BT_PLAN`, `CUSTOMRECORD_BT_TYPES`, `CUSTOMRECORD_BT_CARRIER`, and `CUSTOMRECORD_BT_PLAN_TIER`. The Benefit plan exposed `custrecord_bt_pl_type` and `custrecord_bt_pl_carrier`. The Coverage tier exposed `custrecord_bt_pt_benefit_plan_k`. Verify these mappings in the current account before relying on them.

Finish when every requested reference has a supported outcome. Run these metadata and record reads only for an explicit validation request.
