# Inventory Exceptions Review changelog

## Included in SuiteSkills 1.0.0

Component version: 6.0.0. Source version: 6.0.0.

Before a scenario query, check the relevant exposed feature, permission and record capability. For negative inventory, when InventoryBalance is unavailable for a supported reason, a separately verified current item-location source such as inventoryItemLocations may support item/location quantities only. Verify fields, units, negatives and full scope; do not infer bin/lot/status detail or bypass a denial. Establish timezone from current session/company preferences or explicit user context before date-boundary checks; if unavailable label the time basis and withhold boundary-sensitive conclusions.
