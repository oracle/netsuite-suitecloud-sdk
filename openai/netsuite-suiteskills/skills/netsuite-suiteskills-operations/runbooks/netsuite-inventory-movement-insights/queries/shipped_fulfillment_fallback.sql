SELECT line.item AS itemId, BUILTIN.DF(line.item) AS item,
       line.location AS locationId, BUILTIN.DF(line.location) AS location,
       SUM(line.quantity) AS shippedQuantity
FROM ItemFulfillmentItem line
JOIN ItemFulfillment fulfillment ON fulfillment.id = line.itemFulfillment
JOIN Item itemScope ON itemScope.id = line.item
JOIN Location locationScope ON locationScope.id = line.location
WHERE fulfillment.status = 'C'
  AND (:item_id IS NOT NULL OR itemScope.isInactive = 'F')
  AND (:location_id IS NOT NULL OR locationScope.isInactive = 'F')
  AND (:item_id IS NULL OR line.item = :item_id)
  AND (:location_id IS NULL OR line.location = :location_id)
  AND fulfillment.tranDate >= TO_DATE(':from', 'YYYY-MM-DD')
  AND fulfillment.tranDate < TO_DATE(':to', 'YYYY-MM-DD') + 1
GROUP BY line.item, BUILTIN.DF(line.item), line.location, BUILTIN.DF(line.location)
ORDER BY itemId, locationId
