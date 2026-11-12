SELECT
	orderStage.salesOrderId,
	itemFulfillmentStatus.statusName AS fulfillmentStatus
FROM (
	SELECT
		salesOrderItem.salesOrder AS salesOrderId,
		CASE
			WHEN SUM(NVL(salesOrderItem.quantityFulfilled, 0)) = SUM(NVL(salesOrderItem.quantity, 0)) THEN 3
			WHEN SUM(GREATEST(
				NVL(salesOrderItem.quantityPacked, 0),
				NVL(salesOrderItem.quantityFulfilled, 0)
			)) = SUM(NVL(salesOrderItem.quantity, 0)) THEN 2
			ELSE 1
		END AS fulfillmentStatusRank
	FROM SalesOrderItem salesOrderItem
	WHERE salesOrderItem.salesOrder IN (:salesOrderIds)
		AND NVL(salesOrderItem.isClosed, 'F') = 'F'
		AND salesOrderItem.item IS NOT NULL
	GROUP BY
		salesOrderItem.salesOrder
	HAVING SUM(GREATEST(
		NVL(salesOrderItem.quantityPicked, 0),
		GREATEST(
			NVL(salesOrderItem.quantityPacked, 0),
			NVL(salesOrderItem.quantityFulfilled, 0)
		)
	)) = SUM(NVL(salesOrderItem.quantity, 0))
) orderStage
JOIN (
	SELECT
		statusList.statusName,
		ROW_NUMBER() OVER (
			ORDER BY statusList.statusId
		) AS fulfillmentStatusRank
	FROM (
		SELECT
			itemFulfillmentStatus.id AS statusId,
			NVL(itemFulfillmentStatus.companyPreferenceName, itemFulfillmentStatus.name) AS statusName
		FROM ItemFulfillmentStatus itemFulfillmentStatus
	) statusList
) itemFulfillmentStatus
	ON itemFulfillmentStatus.fulfillmentStatusRank = orderStage.fulfillmentStatusRank
ORDER BY
	orderStage.salesOrderId
