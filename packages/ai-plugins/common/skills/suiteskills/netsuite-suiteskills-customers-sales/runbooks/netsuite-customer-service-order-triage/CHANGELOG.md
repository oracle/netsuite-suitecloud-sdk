# Customer Service Order Triage changelog

## Included in SuiteSkills 1.0.0

Component version: 1.0.0. Source version: unknown.

If a supported order read returns an empty or omitted item sublist, do not conclude that the order has no lines. Use metadata-qualified transactionline evidence for that resolved order ID, with line identity, ordered/fulfilled/backordered quantities and applicable mainline/tax exclusions. Reconcile line totals and status to the order; preserve unknown values when coverage is incomplete. Keep order holds and fulfillment status tied to their own verified sources.
