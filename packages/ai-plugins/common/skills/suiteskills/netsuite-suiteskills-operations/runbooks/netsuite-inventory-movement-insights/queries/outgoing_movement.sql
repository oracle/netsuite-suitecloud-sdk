SELECT
  BUILTIN.DF(item.id) AS item,
  item.id AS itemId,
  BUILTIN.DF(location.id) AS location,
  location.id AS locationId,
  sum(outgoingMovementSource.quantity) AS outgoingMovement
FROM (
  SELECT
    statusTransitions.item,
    statusTransitions.location,
    statusTransitions.currentShippedQuantity AS quantity
  FROM (
    SELECT
      shippedFulfillmentCandidate.fulfillmentId,
      shippedFulfillmentCandidate.item,
      shippedFulfillmentCandidate.location,
      shippedFulfillmentCandidate.currentShippedQuantity,
      transactionHistory.status AS currentStatus,
      transactionHistory.dateTime AS historyDateTime,
      (SELECT prior.status FROM TransactionHistory prior
        WHERE prior.internalId = transactionHistory.internalId
          AND prior.type = transactionHistory.type
          AND prior.action IN ('CREATE', 'CHANGE')
          AND prior.version = (SELECT MAX(earlier.version) FROM TransactionHistory earlier
            WHERE earlier.internalId = transactionHistory.internalId
              AND earlier.type = transactionHistory.type
              AND earlier.action IN ('CREATE', 'CHANGE')
              AND earlier.version < transactionHistory.version)) AS previousStatus
    FROM
      TransactionHistory transactionHistory,
      (
        SELECT
          itemFulfillmentLine.itemFulfillment AS fulfillmentId,
          itemFulfillmentLine.item AS item,
          itemFulfillmentLine.location AS location,
          sum(nvl(itemFulfillmentLine.quantity, 0)) AS currentShippedQuantity
        FROM
          ItemFulfillmentItem itemFulfillmentLine,
          ItemFulfillment parentItemFulfillment

        WHERE itemFulfillmentLine.itemFulfillment = parentItemFulfillment.id(+)
          AND (
            parentItemFulfillment.status = 'C'
            OR parentItemFulfillment.status IS NULL
          )
          AND (:item_id IS NULL OR itemFulfillmentLine.item = :item_id)
          AND (:location_id IS NULL OR itemFulfillmentLine.location = :location_id)
        GROUP BY
          itemFulfillmentLine.itemFulfillment,
          itemFulfillmentLine.item,
          itemFulfillmentLine.location
      ) shippedFulfillmentCandidate
    WHERE transactionHistory.internalId = shippedFulfillmentCandidate.fulfillmentId
      AND transactionHistory.type = 'ItemShip'
      AND transactionHistory.action IN ('CREATE', 'CHANGE')
  ) statusTransitions
  WHERE statusTransitions.currentStatus = 'C'
    AND (
      statusTransitions.previousStatus IS NULL
      OR statusTransitions.previousStatus <> 'C'
    )
  GROUP BY
    statusTransitions.fulfillmentId,
    statusTransitions.item,
    statusTransitions.location,
    statusTransitions.currentShippedQuantity
  HAVING max(statusTransitions.historyDateTime) >= to_date(':from', 'YYYY-MM-DD')
    AND max(statusTransitions.historyDateTime) < to_date(':to', 'YYYY-MM-DD') + 1

  UNION ALL

  SELECT
    inventoryAdjustmentLine.item AS item,
    inventoryAdjustmentLine.location AS location,
    sum(abs(inventoryAdjustmentLine.adjustQtyBy)) AS quantity
  FROM
    InventoryAdjustmentInventory inventoryAdjustmentLine,
    InventoryAdjustment parentInventoryAdjustment
  WHERE inventoryAdjustmentLine.inventoryAdjustment = parentInventoryAdjustment.id
    AND (:item_id IS NULL OR inventoryAdjustmentLine.item = :item_id)
    AND (:location_id IS NULL OR inventoryAdjustmentLine.location = :location_id)
    AND parentInventoryAdjustment.createdDate >= to_date(':from', 'YYYY-MM-DD')
    AND parentInventoryAdjustment.createdDate < to_date(':to', 'YYYY-MM-DD') + 1
    AND inventoryAdjustmentLine.adjustQtyBy < 0
  GROUP BY
    inventoryAdjustmentLine.item,
    inventoryAdjustmentLine.location
) outgoingMovementSource,
  Item item,
  Location location
WHERE item.id = outgoingMovementSource.item
  AND location.id = outgoingMovementSource.location
  AND (:item_id IS NOT NULL OR item.isInactive = 'F')
  AND (:location_id IS NOT NULL OR location.isInactive = 'F')
GROUP BY
  item.id,
  BUILTIN.DF(item.id),
  location.id,
  BUILTIN.DF(location.id)
ORDER BY itemId, locationId
