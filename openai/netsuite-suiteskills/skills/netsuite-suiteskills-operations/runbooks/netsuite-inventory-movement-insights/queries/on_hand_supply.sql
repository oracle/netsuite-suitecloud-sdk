SELECT
  BUILTIN.DF(aggregateItemLocation.item) AS item,
  aggregateItemLocation.item AS itemId,
  BUILTIN.DF(aggregateItemLocation.location) AS location,
  aggregateItemLocation.location AS locationId,
  nvl(aggregateItemLocation.quantityOnHand, 0) AS onHandSupply
FROM
  AggregateItemLocation aggregateItemLocation
WHERE (:item_id IS NULL OR aggregateItemLocation.item = :item_id)
  AND (:item_id IS NOT NULL OR EXISTS (
    SELECT 1
    FROM Item filterItem
    WHERE filterItem.id = aggregateItemLocation.item
      AND filterItem.isInactive = 'F'
  ))
  AND (:location_id IS NULL OR aggregateItemLocation.location = :location_id)
  AND (:location_id IS NOT NULL OR EXISTS (
    SELECT 1
    FROM Location filterLocation
    WHERE filterLocation.id = aggregateItemLocation.location
      AND filterLocation.isInactive = 'F'
  ))
ORDER BY itemId, locationId
