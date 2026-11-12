SELECT
	transferOrderId,
	transferOrderLineId,
	transferOrder AS transferOrder,
	BUILTIN.DF(transferOrder) AS transferOrderDisplay,
	transferOrderNumber,
	sourceLocation AS sourceLocation,
	BUILTIN.DF(sourceLocation) AS sourceLocationDisplay,
	destinationLocation AS destinationLocation,
	BUILTIN.DF(destinationLocation) AS destinationLocationDisplay,
	item AS item,
	BUILTIN.DF(item) AS itemDisplay,
	TO_CHAR(expectedReceiptDate, 'YYYY-MM-DD') AS expectedReceiptDate,
	daysOverdue,
	quantityOrdered,
	quantityReceived,
	quantityOpen
FROM (
	SELECT
		transferOrder.id AS transferOrderId,
		transferOrderItem.line AS transferOrderLineId,
		transferOrderItem.transferOrder AS transferOrder,
		transferOrder.tranid AS transferOrderNumber,
		transferOrder.location AS sourceLocation,
		transferOrder.transferLocation AS destinationLocation,
		transferOrderItem.item AS item,
		transferOrderItem.expectedReceiptDate AS expectedReceiptDate,
		TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD')) - TRUNC(transferOrderItem.expectedReceiptDate) AS daysOverdue,
		ABS(NVL(transferOrderItem.quantity, 0)) AS quantityOrdered,
		ABS(NVL(transferOrderItem.quantityReceived, 0)) AS quantityReceived,
		ABS(NVL(transferOrderItem.quantity, 0)) - ABS(NVL(transferOrderItem.quantityReceived, 0)) AS quantityOpen
	FROM TransferOrder transferOrder
	JOIN TransferOrderItem transferOrderItem
		ON transferOrderItem.transferOrder = transferOrder.id
	WHERE NVL(transferOrderItem.isClosed, 'F') = 'F'
		AND transferOrderItem.item IS NOT NULL
		AND transferOrderItem.location = transferOrder.transferLocation
		AND NVL(transferOrderItem.quantity, 0) < 0
		AND transferOrderItem.expectedReceiptDate IS NOT NULL
		AND transferOrderItem.expectedReceiptDate < TO_DATE(:asOfDate, 'YYYY-MM-DD')
		AND ABS(NVL(transferOrderItem.quantity, 0)) - ABS(NVL(transferOrderItem.quantityReceived, 0)) > 0
		AND (
			:transferOrderScope = 'ALL'
			OR transferOrder.id IN (:transferOrderIds)
		)
		AND (
			:locationScope = 'ALL'
			OR transferOrder.transferLocation IN (:locationIds)
		)
		AND (
			:itemScope = 'ALL'
			OR transferOrderItem.item IN (:itemIds)
		)
	ORDER BY
		transferOrderItem.expectedReceiptDate,
		ABS(NVL(transferOrderItem.quantity, 0)) - ABS(NVL(transferOrderItem.quantityReceived, 0)) DESC,
		transferOrder.tranid,
		transferOrderItem.line
)
WHERE ROWNUM <= :maxRows
