SELECT
	purchaseOrderId,
	purchaseOrderLineId,
	purchaseOrder AS purchaseOrder,
	BUILTIN.DF(purchaseOrder) AS purchaseOrderDisplay,
	purchaseOrderNumber,
	vendorId,
	vendor AS vendor,
	BUILTIN.DF(vendor) AS vendorDisplay,
	item AS item,
	BUILTIN.DF(item) AS itemDisplay,
	location AS location,
	BUILTIN.DF(location) AS locationDisplay,
	TO_CHAR(expectedReceiptDate, 'YYYY-MM-DD') AS expectedReceiptDate,
	daysOverdue,
	quantityOrdered,
	quantityReceived,
	quantityOpen
FROM (
	SELECT
		purchaseOrder.id AS purchaseOrderId,
		purchaseOrderItem.line AS purchaseOrderLineId,
		purchaseOrderItem.purchaseOrder AS purchaseOrder,
		purchaseOrder.tranid AS purchaseOrderNumber,
		purchaseOrder.entity AS vendorId,
		purchaseOrder.entity AS vendor,
		purchaseOrderItem.item AS item,
		purchaseOrderItem.location AS location,
		purchaseOrderItem.expectedReceiptDate AS expectedReceiptDate,
		TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD')) - TRUNC(purchaseOrderItem.expectedReceiptDate) AS daysOverdue,
		ABS(NVL(purchaseOrderItem.quantity, 0)) AS quantityOrdered,
		ABS(NVL(purchaseOrderItem.quantityReceived, 0)) AS quantityReceived,
		ABS(NVL(purchaseOrderItem.quantity, 0)) - ABS(NVL(purchaseOrderItem.quantityReceived, 0)) AS quantityOpen
	FROM PurchaseOrder purchaseOrder
	JOIN PurchaseOrderItem purchaseOrderItem
		ON purchaseOrderItem.purchaseOrder = purchaseOrder.id
	WHERE NVL(purchaseOrderItem.isClosed, 'F') = 'F'
		AND purchaseOrderItem.item IS NOT NULL
		AND purchaseOrderItem.expectedReceiptDate IS NOT NULL
		AND purchaseOrderItem.expectedReceiptDate < TO_DATE(:asOfDate, 'YYYY-MM-DD')
		AND ABS(NVL(purchaseOrderItem.quantity, 0)) - ABS(NVL(purchaseOrderItem.quantityReceived, 0)) > 0
		AND (
			:purchaseOrderScope = 'ALL'
			OR purchaseOrder.id IN (:purchaseOrderIds)
		)
		AND (
			:locationScope = 'ALL'
			OR purchaseOrderItem.location IN (:locationIds)
		)
		AND (
			:vendorScope = 'ALL'
			OR purchaseOrder.entity IN (:vendorIds)
		)
		AND (
			:itemScope = 'ALL'
			OR purchaseOrderItem.item IN (:itemIds)
		)
	ORDER BY
		purchaseOrderItem.expectedReceiptDate,
		ABS(NVL(purchaseOrderItem.quantity, 0)) - ABS(NVL(purchaseOrderItem.quantityReceived, 0)) DESC,
		purchaseOrder.tranid,
		purchaseOrderItem.line
)
WHERE ROWNUM <= :maxRows
