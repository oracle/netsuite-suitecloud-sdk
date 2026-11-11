# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Negative inventory

## Query and meaning

Run `negative_inventory_quantity` with validated scope inputs. Select balances with on-hand < 0 **or** available < 0. Keep both quantities even if only one triggered the exception. Keep item/location/bin/inventory-number grain; do not merge rows because the displayed columns look identical. Preserve source priority: negative on-hand first, most negative quantity, location, item, bin. Ties may exist at the source cap; do not claim exhaustive coverage. Do not paginate.

If primary rows exist, run `negative_inventory_transactions` with distinct returned itemId/locationId arrays and maxRows 625. It ranks inventory-affecting, non-mainline, non-tax transaction lines by transaction date DESC, transaction ID DESC, line ID DESC within each item/location pair. Match only exact pairs present in the primary rows; discard cross-product pairs unrelated to those balances. This is item/location evidence, not a bin/lot-specific cause.

Resolve optional latest-transaction labels/UI links by exact transactionId and the returned transactionType, through supported typed record reads. Never infer type from a document-number prefix or replace a failed typed lookup with all-transaction discovery. Use all successful enrichment independently.

If enrichment fully succeeds without a pair, say `No recent inventory-affecting transaction found`. If an ID/type is known but a verified record reference is unavailable, use `Reference unavailable: <returned transactionDisplay>`. If enrichment fails or is truncated before a pair can be established, use `Unavailable in the current context`; do not claim no transaction exists. Primary balances remain valid.

## Output

Exact heading: `## Negative Inventory Exceptions`

One row uses these bullets in order: **Item**, **Location**, **Bin**, **On-hand Quantity**, **Available Quantity**, **Latest Transaction**, **Recommended actions**.

Multiple rows use one table with exactly: `Item`, `Location`, `Bin`, `On-hand Quantity`, `Available Quantity`, `Latest Transaction`. Put one Recommended actions section after it. Link verified labels; retain returned plain labels otherwise. A null bin is `No bin assigned` in bullets and blank in a table; a failed bin-label lookup is `Reference unavailable`, not no bin.

No results: `No negative inventory exceptions were found for the checked criteria.`

Unavailable: `Negative inventory exception data is unavailable in the current context.`

## Recommended actions

Use exactly these five links for successful one-row/multi-row and explicit guidance-only output. Add no cycle-count, adjustment, transaction-editing, deletion or other corrective advice.

- [Resolve Mismatches to Close an Accounting Period](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1456591.html#bridgehead_N1456890)
- [Enabling Negative Inventory Validation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515570529.html#To-enable-negative-inventory-validation%3A)
- [Setting the Inventory Level Warnings Preference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2254698.html#procedure_N2254732)
- [Avoiding Underwater Inventory](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2264208.html)
- [Reviewing Negative Inventory](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2268458.html)
