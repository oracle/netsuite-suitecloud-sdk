SELECT
  BUILTIN.DF(item.id) AS item,
  item.id AS itemId,
  BUILTIN.DF(location.id) AS location,
  location.id AS locationId,
  sum(incomingSupplySource.quantity) AS incomingSupply
FROM (
  SELECT
    purchaseOrderItemLine.item AS item,
    purchaseOrderItemLine.location AS location,
    sum(
      greatest(
        nvl(purchaseOrderItemLine.quantity, 0) - abs(nvl(purchaseOrderItemLine.quantityReceived, 0)),
        0
      )
    ) AS quantity
  FROM
    PurchaseOrderItem purchaseOrderItemLine,
    PurchaseOrder parentPurchaseOrder
  WHERE purchaseOrderItemLine.purchaseOrder = parentPurchaseOrder.id
    AND NOT EXISTS (
      SELECT 1
      FROM PreviousTransactionLineLink dropShipLink
      WHERE dropShipLink.nextDoc = parentPurchaseOrder.id
        AND dropShipLink.nextLine = purchaseOrderItemLine.line
        AND dropShipLink.linkType = 'DropShip'
    )
    AND (:item_id IS NULL OR purchaseOrderItemLine.item = :item_id)
    AND (:location_id IS NULL OR purchaseOrderItemLine.location = :location_id)
    AND purchaseOrderItemLine.isClosed = 'F'
    AND parentPurchaseOrder.status IN ('B', 'D', 'E')
  GROUP BY
    purchaseOrderItemLine.item,
    purchaseOrderItemLine.location

  UNION ALL

  SELECT
    transferOrderItemLine.item AS item,
    parentTransferOrder.transferLocation AS location,
    sum(
      greatest(
        nvl(transferOrderItemLine.quantity, 0) - nvl(transferOrderItemLine.quantityReceived, 0),
        0
      )
    ) AS quantity
  FROM
    TransferOrderItem transferOrderItemLine,
    TransferOrder parentTransferOrder
  WHERE transferOrderItemLine.transferOrder = parentTransferOrder.id
    AND (:item_id IS NULL OR transferOrderItemLine.item = :item_id)
    AND (:location_id IS NULL OR parentTransferOrder.transferLocation = :location_id)
    AND transferOrderItemLine.isClosed = 'F'
    AND parentTransferOrder.status IN ('B', 'D', 'E', 'F')
  GROUP BY
    transferOrderItemLine.item,
    parentTransferOrder.transferLocation

  UNION ALL

  SELECT
    returnAuthorizationItemLine.item AS item,
    returnAuthorizationItemLine.location AS location,
    sum(
      greatest(
        abs(nvl(returnAuthorizationItemLine.quantity, 0)) - abs(nvl(returnAuthorizationItemLine.quantityReceived, 0)),
        0
      )
    ) AS quantity
  FROM
    ReturnAuthorizationItem returnAuthorizationItemLine,
    ReturnAuthorization parentReturnAuthorization
  WHERE returnAuthorizationItemLine.returnAuthorization = parentReturnAuthorization.id
    AND nvl(returnAuthorizationItemLine.isDropShipment, 'F') = 'F'
    AND (:item_id IS NULL OR returnAuthorizationItemLine.item = :item_id)
    AND (:location_id IS NULL OR returnAuthorizationItemLine.location = :location_id)
    AND returnAuthorizationItemLine.isClosed = 'F'
    AND parentReturnAuthorization.status IN ('B', 'D', 'E', 'F')
  GROUP BY
    returnAuthorizationItemLine.item,
    returnAuthorizationItemLine.location
) incomingSupplySource,
  Item item,
  Location location
WHERE item.id = incomingSupplySource.item
  AND location.id = incomingSupplySource.location
  AND (:item_id IS NOT NULL OR item.isInactive = 'F')
  AND (:location_id IS NOT NULL OR location.isInactive = 'F')
GROUP BY
  item.id,
  BUILTIN.DF(item.id),
  location.id,
  BUILTIN.DF(location.id)
ORDER BY itemId, locationId
