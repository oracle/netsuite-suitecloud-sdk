SELECT
  BUILTIN.DF(item.id) AS item,
  item.id AS itemId,
  BUILTIN.DF(location.id) AS location,
  location.id AS locationId,
  sum(incomingMovementSource.quantity) AS incomingMovement
FROM (
  SELECT
    itemReceiptItemLine.item AS item,
    itemReceiptItemLine.location AS location,
    sum(nvl(itemReceiptItemLine.quantity, 0)) AS quantity
  FROM
    ItemReceiptItem itemReceiptItemLine,
    ItemReceipt parentItemReceipt
  WHERE itemReceiptItemLine.itemReceipt = parentItemReceipt.id
    AND nvl(itemReceiptItemLine.restock, 'T') = 'T'
    AND (:item_id IS NULL OR itemReceiptItemLine.item = :item_id)
    AND (:location_id IS NULL OR itemReceiptItemLine.location = :location_id)
    AND parentItemReceipt.createdDate >= to_date(':from', 'YYYY-MM-DD')
    AND parentItemReceipt.createdDate < to_date(':to', 'YYYY-MM-DD') + 1
  GROUP BY
    itemReceiptItemLine.item,
    itemReceiptItemLine.location

  UNION ALL

  SELECT
    inventoryAdjustmentLine.item AS item,
    inventoryAdjustmentLine.location AS location,
    sum(inventoryAdjustmentLine.adjustQtyBy) AS quantity
  FROM
    InventoryAdjustmentInventory inventoryAdjustmentLine,
    InventoryAdjustment parentInventoryAdjustment
  WHERE inventoryAdjustmentLine.inventoryAdjustment = parentInventoryAdjustment.id
    AND (:item_id IS NULL OR inventoryAdjustmentLine.item = :item_id)
    AND (:location_id IS NULL OR inventoryAdjustmentLine.location = :location_id)
    AND parentInventoryAdjustment.createdDate >= to_date(':from', 'YYYY-MM-DD')
    AND parentInventoryAdjustment.createdDate < to_date(':to', 'YYYY-MM-DD') + 1
    AND inventoryAdjustmentLine.adjustQtyBy > 0
  GROUP BY
    inventoryAdjustmentLine.item,
    inventoryAdjustmentLine.location
) incomingMovementSource,
  Item item,
  Location location
WHERE item.id = incomingMovementSource.item
  AND location.id = incomingMovementSource.location
  AND (:item_id IS NOT NULL OR item.isInactive = 'F')
  AND (:location_id IS NOT NULL OR location.isInactive = 'F')
GROUP BY
  item.id,
  BUILTIN.DF(item.id),
  location.id,
  BUILTIN.DF(location.id)
ORDER BY itemId, locationId
