# Inventory movement insights changelog

## Included in SuiteSkills 1.0.0

Component version: 1.0.0. Source version: 1.0.0.

Before interpreting an empty outgoing-history result, establish whether the history source covers known in-scope fulfillments. Sparse TransactionHistory means outgoing movement is unverified, not zero. Use the separately packaged shipped-fulfillment fallback only after verifying its fields, current shipped status, quantity units and transaction-date meaning. Label that fallback “currently shipped fulfillment quantities by transaction date,” not historical shipping-event movement; it excludes inventory adjustments and cannot be mixed into the existing net-movement formula without a common verified basis. Preserve unknown-location demand as a separate group when all locations are requested; do not allocate it to a named warehouse.
