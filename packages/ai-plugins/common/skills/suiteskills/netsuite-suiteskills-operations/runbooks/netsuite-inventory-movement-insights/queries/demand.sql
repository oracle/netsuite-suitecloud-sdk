SELECT
  BUILTIN.DF(salesOrderItemLine.item) AS item,
  salesOrderItemLine.item AS itemId,
  BUILTIN.DF(salesOrderItemLine.location) AS location,
  salesOrderItemLine.location AS locationId,
  sum(
    CASE
      WHEN salesOrderItemLine.isClosed = 'T'
        THEN nvl(salesOrderItemLine.quantityFulfilled, 0)
      ELSE salesOrderItemLine.quantity
    END
  ) AS demand
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
  AND NOT EXISTS (
    SELECT 1
    FROM TransactionLine transactionLine
    WHERE transactionLine.transaction = parentSalesOrder.id
      AND transactionLine.id = salesOrderItemLine.line
      AND transactionLine.dropShip = 'T'
  )
  AND parentSalesOrder.status NOT IN ('A', 'C')
  AND parentSalesOrder.createdDate >= to_date(':from', 'YYYY-MM-DD')
  AND parentSalesOrder.createdDate < to_date(':to', 'YYYY-MM-DD') + 1
GROUP BY
  salesOrderItemLine.item,
  BUILTIN.DF(salesOrderItemLine.item),
  salesOrderItemLine.location,
  BUILTIN.DF(salesOrderItemLine.location)
ORDER BY itemId, locationId
