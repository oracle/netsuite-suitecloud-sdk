# Fulfillment performance insights changelog

## Included in SuiteSkills 1.0.0

Component version: 1.0.0. Source version: 1.0.0.

Use the packaged adapter with the exact query file and parameter JSON. Its query-digests.json records the shipped template hashes. The revised query selects status transitions without window functions; its connector acceptance still requires current metadata and a scoped test. Use pageSize/pageIndex with stable itemFulfillmentId order and establish coverage before aggregation. Missing history/timing yields unavailable durations, never zero. A successful query alone does not verify lifecycle timing semantics.
