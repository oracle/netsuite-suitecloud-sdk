SELECT DISTINCT
  BUILTIN.DF(transferOrderItemLine.transferOrder) AS transferOrder,
  transferOrderItemLine.transferOrder AS transferOrderId,
  BUILTIN.DF(parentTransferOrder.transferLocation) AS destinationLocation,
  parentTransferOrder.transferLocation AS destinationLocationId
FROM
  TransferOrderItem transferOrderItemLine,
  TransferOrder parentTransferOrder
WHERE transferOrderItemLine.transferOrder = parentTransferOrder.id
  AND transferOrderItemLine.item = :item_id
  AND parentTransferOrder.location = :location_id
  AND parentTransferOrder.status IN ('B', 'D', 'E')
  AND transferOrderItemLine.isClosed = 'F'
  AND greatest(
        nvl(transferOrderItemLine.quantity, 0)
          - nvl(transferOrderItemLine.quantityFulfilled, 0),
        0
      ) > 0
ORDER BY transferOrderId, destinationLocationId
