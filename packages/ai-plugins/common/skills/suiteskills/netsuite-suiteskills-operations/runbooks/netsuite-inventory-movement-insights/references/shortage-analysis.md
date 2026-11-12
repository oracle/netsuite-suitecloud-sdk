# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Supply and shortage analysis

All metrics here are **current snapshots**, independent of a movement or historical-demand period. Follow [retrieval and tools](retrieval-and-tools.md) and the [query catalog](query-catalog.md).

**Account evidence:** Follow [account validation](account-validation.md). Preserve Incoming Supply's `TransferOrder.status` field and `B,D,E,F` filter while checking relevant metadata and reconciling its purchase, transfer, and return sources. An unexplained omission permits bounded validation; it does not establish correct status meanings. Calculate definitive Total Supply, Shortage, supply above open demand, and receiving priority only from valid, complete inputs with applicable validation. If an input fails, is incomplete, or remains materially unverified, withhold dependent conclusions and report supported independent metrics. Do not substitute another status field or remove a source branch.

## Calculate only what is needed

| Metric | Primary source / calculation |
| --- | --- |
| Open Demand | `queries/open_demand.sql`: eligible open sales-order quantity remaining unfulfilled, clamped per line. |
| On-hand Supply | `queries/on_hand_supply.sql`: current `quantityOnHand`; preserve negative inventory. |
| Incoming Supply | `queries/incoming_supply.sql`: eligible open quantities remaining to receive from purchase orders, transfer orders, and customer return authorizations. |
| Total Supply | `onHandSupply + incomingSupply`. |
| Shortage | `0` if `openDemand <= 0`; otherwise `max(openDemand − totalSupply, 0)`. |

Keep Unknown location demand separate from warehouse shortage and receiving-priority rankings. Do not join it to warehouse supply or silently assign it to a location. Report that unallocated demand can affect the broader assessment. Use the same verified item/location IDs, quantity units, and compatible retrieval time across inputs. All required source queries must be complete and successful for each reported scope.

Incoming Supply uses purchase/return line locations and transfer-order destination locations. Preserve the query's per-line clamping, sign normalization, open-line/status checks, and drop-ship exclusions. Expected returns are not guaranteed receipts; the restock check belongs to incoming receipt movement, not the original incoming-supply query.

On-hand Supply means on-hand stock, not stock free of commitments. Total Supply includes quantities not received yet. Shortage is a quantity-gap signal; it does not model promised dates, receipt timing, lead times, safety stock, or shipping feasibility.

## Answer by request type

**Direct supply question:** report the requested metric for every explicitly requested location, including verified zero or negative on-hand. Do not apply the positive-shortage filter to a supply lookup.

**Shortage risk:** qualify locations with `shortage > 0`, rank greatest first, and preserve ties. For one result, state the shortage and show Open Demand, On-hand Supply, Incoming Supply, and Total Supply. For several, use `Location | Open Demand | Total Supply | Shortage` and identify the highest or tied highest shortage. For a singular highest request, retain only the winner(s).

**Receiving priority:** recommend the location(s) with the greatest positive Shortage. Explain that the recommendation is based on the largest current quantity gap. Use a short list for one result or `Location | Total Supply | Open Demand | Shortage` for several. This does not establish where stock can be sourced or how much can actually be shipped.

**Surplus question:** if the user means supply in excess of this skill's open-demand measure, calculate `max(totalSupply − openDemand, 0)` and label it “supply above open demand.” Include only positive values for a surplus ranking. State that this includes expected incoming quantities and does not establish freely transferable stock. If “surplus” means another business threshold, clarify it first.

If no positive Shortage exists after complete retrieval and applicable validation of all inputs, say no locations in the requested scope currently show a shortage under this definition. Do not claim there is no timing-related stockout risk. If an input is unavailable, identify the missing metric and do not manufacture Shortage or a receiving priority.

## Scope note

“Shortage is open demand not covered by on-hand plus incoming supply. It is a current quantity comparison, not a delivery-date forecast. Eligible sales-order lines supply demand; eligible purchase, transfer, and customer-return lines supply incoming quantities. Drop-ship exclusions and location filters follow the source queries; unallocated demand is shown separately and excluded from warehouse shortage and receiving-priority calculations.”

For a supply-only request, shorten this to the on-hand/incoming distinction and the relevant source/location exclusions.
