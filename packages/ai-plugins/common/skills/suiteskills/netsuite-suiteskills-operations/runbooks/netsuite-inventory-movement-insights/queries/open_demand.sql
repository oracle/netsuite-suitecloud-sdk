SELECT
  BUILTIN.DF(salesOrderItemLine.item) AS item,
  salesOrderItemLine.item AS itemId,
  BUILTIN.DF(salesOrderItemLine.location) AS location,
  salesOrderItemLine.location AS locationId,
  sum(
    greatest(
      salesOrderItemLine.quantity - nvl(salesOrderItemLine.quantityFulfilled, 0),
      0
    )
  ) AS openDemand
FROM
  SalesOrderItem salesOrderItemLine,
  SalesOrder parentSalesOrder
WHERE salesOrderItemLine.salesOrder = parentSalesOrder.id
  AND (:item_id IS NULL OR salesOrderItemLine.item = :item_id)
  AND (:item_id IS NOT NULL OR EXISTS (
    SELECT 1
    FROM Item filterItem
    WHERE filterItem.id = salesOrderItemLine.item
      AND filterItem.isInactive = 'F'
  ))
  AND (:location_id IS NULL OR salesOrderItemLine.location = :location_id)
  AND (:location_id IS NOT NULL OR salesOrderItemLine.location IS NULL OR EXISTS (
    SELECT 1
    FROM Location filterLocation
    WHERE filterLocation.id = salesOrderItemLine.location
      AND filterLocation.isInactive = 'F'
  ))
  AND salesOrderItemLine.isClosed = 'F'
  AND NOT EXISTS (
    SELECT 1
    FROM TransactionLine transactionLine
    WHERE transactionLine.transaction = parentSalesOrder.id
      AND transactionLine.id = salesOrderItemLine.line
      AND transactionLine.dropShip = 'T'
  )
  AND parentSalesOrder.status IN ('B', 'D', 'E')
GROUP BY
  salesOrderItemLine.item,
  BUILTIN.DF(salesOrderItemLine.item),
  salesOrderItemLine.location,
  BUILTIN.DF(salesOrderItemLine.location)
ORDER BY itemId, locationId
