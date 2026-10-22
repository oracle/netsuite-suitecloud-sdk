-- Reference-only batched vendor identity/activity; never purchasing approval.
-- Read ../references/vendor-comparison-sources.md before preparing any SELECT.
-- Current ns_getSuiteQLMetadata must verify EVERY table, column and predicate.
-- Missing/denied metadata stops the branch: no probes or alternate-SQL bypass.
-- {{vendor_ids}} is a resolved nonempty distinct positive-integer list, not raw text.
-- Placeholders are not native bindings or shared-binder compatibility.
-- Skill-local bounds (subject to tighter actual tool limits): pageSize 20 default, maximum 100; pageIndex starts at 0;
-- at most five pages, within twenty total workflow account reads including metadata.
SELECT
    v.id AS vendor_id,
    v.entityid AS vendor_code,
    v.companyname AS vendor_name,
    v.isinactive AS is_inactive
FROM Vendor v
WHERE v.id IN ({{vendor_ids}})
ORDER BY v.id ASC
