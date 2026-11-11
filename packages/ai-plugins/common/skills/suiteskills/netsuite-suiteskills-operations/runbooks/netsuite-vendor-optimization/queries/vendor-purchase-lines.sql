-- Reference-only read-only PO history template; not a current-price/approval source.
-- Read ../references/vendor-comparison-sources.md before preparing any SELECT.
-- Current ns_getSuiteQLMetadata must verify EVERY table, column, predicate and join.
-- Missing/denied metadata stops the branch: no probes or alternate-SQL bypass.
-- Typed template placeholders are not native bindings or shared-binder compatibility.
-- Resolve positive-integer ID lists and valid ordered YYYY-MM-DD dates; no raw text.
-- Skill-local bounds (subject to tighter actual tool limits): pageSize 20 default, maximum 100; pageIndex starts at 0;
-- at most five pages, within twenty total workflow account reads including metadata.
SELECT
    t.id AS transaction_id,
    t.tranid AS document_number,
    t.trandate AS transaction_date,
    t.entity AS vendor_id,
    t.currency AS currency_id,
    t.status AS transaction_status,
    tl.id AS line_id,
    tl.item AS item_id,
    tl.subsidiary AS subsidiary_id,
    tl.units AS unit_id,
    tl.quantity AS raw_quantity,
    tl.foreignamount AS raw_line_amount
FROM Transaction t
JOIN TransactionLine tl ON tl.transaction = t.id
WHERE t.type = 'PurchOrd'
  AND t.voided = 'F'
  AND tl.mainline = 'F'
  AND tl.taxline = 'F'
  AND tl.item IN ({{item_ids}})
  AND tl.subsidiary IN ({{subsidiary_ids}})
  AND t.trandate >= TO_DATE('{{start_date}}', 'YYYY-MM-DD')
  AND t.trandate < TO_DATE('{{as_of_date}}', 'YYYY-MM-DD') + 1
ORDER BY t.trandate DESC, t.id DESC, tl.id ASC
