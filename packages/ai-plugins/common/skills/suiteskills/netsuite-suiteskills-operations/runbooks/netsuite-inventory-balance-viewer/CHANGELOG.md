# Inventory Balance Viewer changelog

## Included in SuiteSkills 1.0.0

Component version: 4.0.0. Source version: 4.0.0.

Check relevant feature/access evidence before selecting a balance source. Prefer the supported dedicated/detailed balance source. If InventoryBalance is unavailable because its prerequisite is absent, use a separately authorized and metadata-verified inventoryItemLocations item-location source for current on-hand/available quantities when it supports the requested measure. Establish its item/location keys, field meanings, units and completeness. This fallback does not answer bin, lot or inventory-status detail. Never bypass an access denial, combine both sources into duplicate totals, or call an omitted quantity zero. See the qualified item-location fallback in references/connection.md.
