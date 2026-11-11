# Receipt lead-time restoration contract

No active receipt query is supplied. Document-only linkage can attach another item's receipt to the selected item. Preserve the original source externally; do not run it or a speculative replacement.

Before authoring a replacement, obtain current account/role SuiteQL metadata and independently supported key/business evidence for all of these:

1. Exact purchase-order and receipt line identity and previous/next line-link keys; establish whether those keys reference line IDs or another index. Confirm both document and line sides, expected transaction types, duplicates and cardinality. Do not invent link type values or assume a document link proves receipt of this item.
2. Selected raw item ID on both linked lines; qualified positive receipt activity and ordered/received quantity signs, historical units/conversions, partial/reversed/returned receipt handling. A transaction label or amount is insufficient.
3. Vendor identity from the purchase-order source and requested location meaning (purchase-order line, receipt line, or both). Resolve that definition before applying the filter; do not silently substitute receipt/header/vendor display labels.
4. Window is inclusive by purchase-order date, preserving the original pair metric; receipts linked to those orders may occur outside that window. Do not switch to receipt-date selection. Confirm calendar date difference, negative intervals and missing dates before deriving days.
5. Complete requested-scope line/link population and unique purchase-order/receipt document pairs after item-line validation. Multiple target lines within one document pair count once. Three pairs may come from one order; do not claim three independent orders. A cap or failed page blocks pair count/median.
6. Reconcile fixtures against independent receipt/PO records, including target item plus other-item-only receipts, duplicate links, multiple lines per pair, split receipts, mixed locations/vendors/units and reversed receipts. Confirm current compiler/tool support before any approved account execution.

Only an explicitly reviewed replacement query bound to this evidence may calculate the median with at least three qualified unique pairs. Fewer pairs: show evidence count only when complete, median unavailable. Until restored: lead time Not checked; independently verified purchasing history remains useful.
