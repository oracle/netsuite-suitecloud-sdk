# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Query catalog

All paths below are relative to this reference file. This skill contains eight primary queries: seven metric/candidate queries and an exact item lookup. They define the intended calculations and expected outputs, not evidence of current-account compatibility. Follow [retrieval and tools](retrieval-and-tools.md) and [account validation](account-validation.md) to check relevant metadata, use bounded fallback reads when appropriate, and reconcile representative results. Metadata checks are allowed for every relevant type.

**Transfer queries:** Preserve `TransferOrder.status` and both authored filters while checking their applicability in the current account. An unexplained metadata omission permits bounded validation; explicit restrictions or actual query errors stop affected work. Reconcile transfer status eligibility, locations, and quantities before treating these calculations as validated, or reuse applicable evidence.

## Inputs and output contracts

| Query | Exact parameters | Metric column / row grain |
| --- | --- | --- |
| [Exact item lookup](../queries/resolve_item.sql) | `name` | `id`, `itemid`, `displayname`; one matching item record, ordered by ID. |
| [Demand](../queries/demand.sql) | `item_id`, `location_id`, `from`, `to` | `demand`; one item/location |
| [Open Demand](../queries/open_demand.sql) | `item_id`, `location_id` | `openDemand`; one item/location |
| [Incoming Movement](../queries/incoming_movement.sql) | `item_id`, `location_id`, `from`, `to` | `incomingMovement`; one item/location |
| [Outgoing Movement](../queries/outgoing_movement.sql) | `item_id`, `location_id`, `from`, `to` | `outgoingMovement`; one item/location |
| [On-hand Supply](../queries/on_hand_supply.sql) | `item_id`, `location_id` | `onHandSupply`; one item/location |
| [Incoming Supply](../queries/incoming_supply.sql) | `item_id`, `location_id` | `incomingSupply`; one item/location |
| [Open transfer candidates](../queries/open_transfer_orders.sql) | `item_id`, `location_id` | One distinct transfer-order/destination combination; `location_id` means **source** location. |

For the six metrics, both ID parameters are required keys with either a positive integer value or JSON `null`. Null selects all active records of that type; it does not mean an unknown identity. Transfer candidates require positive IDs for both keys. The binder also accepts digit-only integer strings, but prefer integers. Do not pass booleans, arrays, fractions, names, or zero IDs. Dates must be real ISO calendar dates with `from <= to`.

The item lookup uses the separate `name` text parameter: a nonempty string of at most 500 characters with no control characters. The unchanged compiler escapes literal quotes. Exact equality treats `%` and `_` as ordinary characters, not wildcards. A complete result with one distinct ID resolves the item; multiple IDs require clarification. Check or reuse relevant metadata; an unexplained omission permits this unchanged bounded lookup. Saved-search discovery is not a prerequisite. Do not hardcode any example name or ID.

All six metric rows include `item`, `itemId`, `location`, `locationId`, and the metric column above. Candidate rows contain `transferOrder`, `transferOrderId`, `destinationLocation`, and `destinationLocationId`. Normalize alias casing only when the connector documents that behavior; retain identities and quantities unchanged.

Metric queries order by `itemId, locationId`. Candidates order by `transferOrderId, destinationLocationId`. Neither order is a business ranking: calculate requested rankings locally after completeness checks. See the retrieval reference for paging/read limits.

## Expected schema and intended meaning

Read the exact query for every field and join. This table is a dependency and validation guide, not proof that the named schema exists or behaves identically in every account. Check needed metadata when current evidence is missing; do not rediscover every dependency on every request. Validate the intended meaning against representative records or an equivalent report, including result grain and status/quantity/date behavior. Review new SQL or proposed schema changes separately, as described in the retrieval reference.

For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Unexplained history metadata gaps require bounded validation and history/date reconciliation; actual history/query errors block the affected metric. |
| On-hand Supply | `AggregateItemLocation`, `Item`, `Location` | Exactly one quantityOnHand row per item/location; on-hand can be negative. Additional account dimensions must not duplicate this grain. |
| Incoming Supply | `PurchaseOrderItem`, `PurchaseOrder`, `PreviousTransactionLineLink`, `TransferOrderItem`, `TransferOrder`, `ReturnAuthorizationItem`, `ReturnAuthorization`, `Item`, `Location` | Open lines; purchase status `B,D,E`, transfer/return status `B,D,E,F`; PO DropShip-link and return isDropShipment exclusions; correct receiving locations; per-line remaining quantities and sign rules below. |
| Open transfer candidates | `TransferOrderItem`, `TransferOrder` | Source `location`, destination `transferLocation`; statuses `B,D,E`; open lines with ordered minus fulfilled greater than zero; DISTINCT orders/destinations. |

The original Incoming Supply formulas are:

- Purchase orders: `max(nvl(quantity,0) − abs(nvl(quantityReceived,0)), 0)`.
- Transfer orders: `max(nvl(quantity,0) − nvl(quantityReceived,0), 0)`.
- Customer returns: `max(abs(nvl(quantity,0)) − abs(nvl(quantityReceived,0)), 0)`.

Do not replace these with one generic sign rule. Preserve the authored status codes, `BUILTIN.DF`, date functions, outer joins, and status-transition semantics. For TransferOrder.status, preserve the authored filters: Incoming Supply uses `B,D,E,F`; Open Transfer Candidates uses `B,D,E`. If actual execution reports an unavailable table/field/relationship, stop the affected query and report the error; do not improvise a mapping to another table. The exact item lookup does not independently validate TransactionHistory behavior.

The source's non-negative movement expectation depends on source quantity semantics. Validate unexpected signs rather than changing the SQL. Require eligible item identities. Demand and Open Demand retain null locations as a separate Unknown location group only for all-location requests; other metrics retain their eligible-location predicates. Verify location IDs before warehouse comparisons, but do not drop the permitted unknown group from demand coverage.

## Query compilation helpers

Use [compile_query.py](../scripts/compile_query.py), which imports [bind_query.py](../scripts/bind_query.py). The compiler uses a local binder adapter that checks the packaged query digest and delegates typed parameters to the shared binder. Use the documented compiler interface; no external publisher registry is required.

### Sparse-history fallback

An empty history result does not prove zero shipments. Compare history coverage with independently supported in-scope fulfillment evidence. The [shipped-fulfillment query](../queries/shipped_fulfillment_fallback.sql) is a distinct, metadata-qualified fallback for current shipped quantities by transaction date. It omits adjustments and does not reconstruct shipment-event timestamps. Label the narrower metric and date basis, retain units/item/location grain, and withhold original outgoing/net-movement conclusions when that equivalence cannot be established. A denial is not permission to use the fallback. Do not add the fallback to history results, which would double count shipments.
