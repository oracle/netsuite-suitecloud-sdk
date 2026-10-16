SELECT
	salesOrderId,
	salesOrder AS salesOrder,
	BUILTIN.DF(salesOrder) AS salesOrderDisplay,
	salesOrderNumber,
	customer AS customer,
	BUILTIN.DF(customer) AS customerDisplay,
	TO_CHAR(applicableShipDate, 'YYYY-MM-DD') AS applicableShipDate,
	daysUntilShipDate,
	riskStage,
	quantityOrdered,
	quantityFulfilled,
	quantityNotAllocated,
	quantityReady,
	quantityPickedNotPacked,
	quantityPackedNotShipped
FROM (
	SELECT
		salesOrder.id AS salesOrderId,
		salesOrderItem.salesorder AS salesOrder,
		salesOrder.tranId AS salesOrderNumber,
		salesOrder.entity AS customer,
		MIN(NVL(salesOrderItem.expectedShipDate, NVL(salesOrderItem.requestedDate, salesOrder.shipDate))) AS applicableShipDate,
		TRUNC(MIN(NVL(salesOrderItem.expectedShipDate, NVL(salesOrderItem.requestedDate, salesOrder.shipDate))))
			- TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD')) AS daysUntilShipDate,
		CASE
			WHEN SUM(GREATEST(
				NVL(salesOrderItem.quantity, 0) - NVL(salesOrderItem.quantityFulfilled, 0)
					- GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0)),
				0
			)) > 0 THEN 'NOT_ALLOCATED'
			WHEN SUM(GREATEST(
				GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0))
					- GREATEST(NVL(salesOrderItem.quantityPicked, 0) - NVL(salesOrderItem.quantityFulfilled, 0), 0),
				0
			)) > 0 THEN 'READY'
			WHEN SUM(GREATEST(
				NVL(salesOrderItem.quantityPicked, 0)
					- GREATEST(NVL(salesOrderItem.quantityPacked, 0), NVL(salesOrderItem.quantityFulfilled, 0)),
				0
			)) > 0 THEN 'PICKED'
			ELSE 'PACKED'
		END AS riskStage,
		SUM(NVL(salesOrderItem.quantity, 0)) AS quantityOrdered,
		SUM(NVL(salesOrderItem.quantityFulfilled, 0)) AS quantityFulfilled,
		SUM(GREATEST(
			NVL(salesOrderItem.quantity, 0) - NVL(salesOrderItem.quantityFulfilled, 0)
				- GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0)),
			0
		)) AS quantityNotAllocated,
		SUM(GREATEST(
			GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0))
				- GREATEST(NVL(salesOrderItem.quantityPicked, 0) - NVL(salesOrderItem.quantityFulfilled, 0), 0),
			0
		)) AS quantityReady,
		SUM(GREATEST(
			NVL(salesOrderItem.quantityPicked, 0)
				- GREATEST(NVL(salesOrderItem.quantityPacked, 0), NVL(salesOrderItem.quantityFulfilled, 0)),
			0
		)) AS quantityPickedNotPacked,
		SUM(GREATEST(NVL(salesOrderItem.quantityPacked, 0) - NVL(salesOrderItem.quantityFulfilled, 0), 0)) AS quantityPackedNotShipped
	FROM SalesOrder salesOrder
	JOIN SalesOrderItem salesOrderItem
		ON salesOrderItem.salesorder = salesOrder.id
	WHERE NVL(salesOrderItem.isClosed, 'F') = 'F'
		AND salesOrderItem.item IS NOT NULL
		AND NVL(salesOrderItem.expectedShipDate, NVL(salesOrderItem.requestedDate, salesOrder.shipDate)) IS NOT NULL
		AND (
			:salesOrderScope = 'ALL'
			OR salesOrder.id IN (:salesOrderIds)
		)
		AND (
			:customerScope = 'ALL'
			OR salesOrder.entity IN (:customerIds)
		)
		AND (
			:locationScope = 'ALL'
			OR salesOrderItem.location IN (:locationIds)
		)
		AND (
			:itemScope = 'ALL'
			OR salesOrderItem.item IN (:itemIds)
		)
	GROUP BY
		salesOrder.id,
		salesOrderItem.salesorder,
		salesOrder.tranId,
		salesOrder.entity
	HAVING SUM(GREATEST(NVL(salesOrderItem.quantity, 0) - NVL(salesOrderItem.quantityFulfilled, 0), 0)) > 0
		AND MIN(NVL(salesOrderItem.expectedShipDate, NVL(salesOrderItem.requestedDate, salesOrder.shipDate)))
			< TO_DATE(:asOfDate, 'YYYY-MM-DD') + 2
	ORDER BY
		CASE
			WHEN SUM(GREATEST(
				NVL(salesOrderItem.quantity, 0) - NVL(salesOrderItem.quantityFulfilled, 0)
					- GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0)),
				0
			)) > 0 THEN 1
			WHEN SUM(GREATEST(
				GREATEST(NVL(salesOrderItem.quantityCommitted, 0), NVL(salesOrderItem.quantityAllocated, 0))
					- GREATEST(NVL(salesOrderItem.quantityPicked, 0) - NVL(salesOrderItem.quantityFulfilled, 0), 0),
				0
			)) > 0 THEN 2
			WHEN SUM(GREATEST(
				NVL(salesOrderItem.quantityPicked, 0)
					- GREATEST(NVL(salesOrderItem.quantityPacked, 0), NVL(salesOrderItem.quantityFulfilled, 0)),
				0
			)) > 0 THEN 3
			ELSE 4
		END,
		MIN(NVL(salesOrderItem.expectedShipDate, NVL(salesOrderItem.requestedDate, salesOrder.shipDate))),
		salesOrder.id
)
WHERE ROWNUM <= :maxRows
