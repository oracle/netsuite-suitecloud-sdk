# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Item-Type and Location Routing

Read this reference only when the selected item is a Matrix child, Kit/Package, Assembly, or
Service item, or when the user asks for a city/street/physical-site interpretation of a location.
It governs evidence selection only and does not authorize inventory, order, or location changes.

## Item-type routes

- For a selected Matrix child or variant, treat that child as the selected item. Use its direct
  current-balance evidence and let its validated item type control the route. Do not substitute a
  parent Matrix summary, sibling variant, or parent-level quantity for the child's balance.
- For a validated Kit/Package item, do not expect an item-level inventory balance. Read its
  metadata-confirmed component composition and each required member quantity, then use bounded
  current component balances at the requested location or resolved comparison set. Do not apply
  this Kit/Package path to an Assembly item: assess an assembly's own current balance first.
- If an Assembly item's direct current-balance source returns no rows and an item-wide source
  returns no compatible quantity, state that current availability cannot be established from
  accessible sources. Do not turn either result into zero, derive assembly availability from
  components, or speculate about assembly builds, receipts, or setup history.
- For a selected Service item, do not query or manufacture an inventory balance. State that this
  skill cannot establish physical-stock availability for the service, and ask for a separately
  identified inventory-tracked item if that is what the user means. Do not infer a related part,
  accessory, capacity, appointment, or resource availability.

## Physical location route

When a city, street address, or physical warehouse identity is material, use a narrowly resolved
`location` record only when an existing validated path supports it. If the user reports changed
location access, make one targeted capability check for the relevant location/address path, then
use it only if it validates the required source and fields. Verify that the resolved record is the
same location as the balance source before using it to answer the request. Otherwise use only the
returned balance labels; do not probe guessed Location tables or records.
