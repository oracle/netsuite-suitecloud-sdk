SELECT
	item AS item,
	BUILTIN.DF(item) AS itemDisplay,
	quantityOnHand,
	location AS location,
	BUILTIN.DF(location) AS locationDisplay,
	binNumber AS bin,
	BUILTIN.DF(binNumber) AS binDisplay,
	putawayArea,
	agingStartDate,
	agingHours
FROM (
	SELECT
		agedBalance.item AS item,
		agedBalance.quantityOnHand AS quantityOnHand,
		agedBalance.location AS location,
		agedBalance.binNumber AS binNumber,
		agedBalance.putawayArea AS putawayArea,
		agedBalance.agingStartDate AS agingStartDate,
		ROUND(
			(
				TO_DATE(:asOfDateTime, 'YYYY-MM-DD HH24:MI:SS')
				- TO_DATE(
					TO_CHAR(agedBalance.agingStartDate, 'YYYY-MM-DD'),
					'YYYY-MM-DD'
				)
			) * 24,
			1
		) AS agingHours
	FROM (
		SELECT
			receiptLayer.item AS item,
			receiptLayer.quantityOnHand AS quantityOnHand,
			receiptLayer.location AS location,
			receiptLayer.binNumber AS binNumber,
			receiptLayer.inventoryNumber AS inventoryNumber,
			receiptLayer.inventoryStatus AS inventoryStatus,
			receiptLayer.putawayArea AS putawayArea,
			MAX(
				CASE
					WHEN receiptLayer.cumulativeReceivedQuantity >= receiptLayer.quantityOnHand
						THEN receiptLayer.receiptTransactionDate
				END
			) AS agingStartDate
		FROM (
			SELECT
				matchingReceipt.item AS item,
				matchingReceipt.quantityOnHand AS quantityOnHand,
				matchingReceipt.location AS location,
				matchingReceipt.binNumber AS binNumber,
				matchingReceipt.inventoryNumber AS inventoryNumber,
				matchingReceipt.inventoryStatus AS inventoryStatus,
				matchingReceipt.putawayArea AS putawayArea,
				matchingReceipt.receiptTransactionDate AS receiptTransactionDate,
				SUM(matchingReceipt.receivedQuantity) OVER (
					PARTITION BY
						matchingReceipt.item,
						matchingReceipt.location,
						matchingReceipt.binNumber,
						matchingReceipt.inventoryNumber,
						matchingReceipt.inventoryStatus
					ORDER BY
						matchingReceipt.receiptTransactionDate DESC,
						matchingReceipt.receiptId DESC,
						matchingReceipt.receiptLineId DESC,
						matchingReceipt.assignmentId DESC
					ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
				) AS cumulativeReceivedQuantity
			FROM (
				SELECT
					inventoryBalance.item AS item,
					NVL(inventoryBalance.quantityOnHand, 0) AS quantityOnHand,
					inventoryBalance.location AS location,
					inventoryBalance.binNumber AS binNumber,
					inventoryBalance.inventoryNumber AS inventoryNumber,
					inventoryBalance.inventoryStatus AS inventoryStatus,
					CASE
						WHEN inventoryBalance.binNumber IS NULL THEN 'RECEIVING_AREA'
						ELSE 'INBOUND_STAGING'
					END AS putawayArea,
					itemReceipt.id AS receiptId,
					itemReceiptItem.line AS receiptLineId,
					inventoryAssignment.id AS assignmentId,
					itemReceipt.tranDate AS receiptTransactionDate,
					NVL(inventoryAssignment.quantity, 0) AS receivedQuantity
				FROM InventoryBalance inventoryBalance
				LEFT JOIN Bin bin
					ON bin.id = inventoryBalance.binNumber
				JOIN ItemReceiptItem itemReceiptItem
					ON itemReceiptItem.item = inventoryBalance.item
				JOIN ItemReceipt itemReceipt
					ON itemReceipt.id = itemReceiptItem.itemReceipt
					AND NVL(itemReceiptItem.location, itemReceipt.location) = inventoryBalance.location
				JOIN InventoryAssignment inventoryAssignment
					ON inventoryAssignment.transaction = itemReceipt.id
					AND inventoryAssignment.transactionLine = itemReceiptItem.line
					AND NVL(inventoryAssignment.quantity, 0) > 0
					AND (
						inventoryAssignment.bin = inventoryBalance.binNumber
						OR (
							inventoryAssignment.bin IS NULL
							AND inventoryBalance.binNumber IS NULL
						)
					)
					AND (
						inventoryAssignment.inventoryNumber = inventoryBalance.inventoryNumber
						OR (
							inventoryAssignment.inventoryNumber IS NULL
							AND inventoryBalance.inventoryNumber IS NULL
						)
					)
					AND NVL(inventoryAssignment.inventoryStatus, 1)
						= NVL(inventoryBalance.inventoryStatus, 1)
				WHERE NVL(inventoryBalance.quantityOnHand, 0) > 0
					AND TO_DATE(
						TO_CHAR(itemReceipt.tranDate, 'YYYY-MM-DD'),
						'YYYY-MM-DD'
					) <= TRUNC(TO_DATE(:asOfDateTime, 'YYYY-MM-DD HH24:MI:SS'))
					AND (
						inventoryBalance.binNumber IS NULL
						OR bin.type = 'INBOUND_STAGING'
					)
					AND (
						:putawayAreaScope = 'ALL'
						OR (
							:putawayAreaScope = 'NO_BIN'
							AND inventoryBalance.binNumber IS NULL
						)
						OR (
							:putawayAreaScope = 'INBOUND_STAGING'
							AND inventoryBalance.binNumber IS NOT NULL
							AND bin.type = 'INBOUND_STAGING'
						)
					)
					AND (
						:locationScope = 'ALL'
						OR inventoryBalance.location IN (:locationIds)
					)
					AND (
						:itemScope = 'ALL'
						OR inventoryBalance.item IN (:itemIds)
					)
					AND (
						:binScope = 'ALL'
						OR inventoryBalance.binNumber IN (:binIds)
					)
			) matchingReceipt
		) receiptLayer
		GROUP BY
			receiptLayer.item,
			receiptLayer.quantityOnHand,
			receiptLayer.location,
			receiptLayer.binNumber,
			receiptLayer.inventoryNumber,
			receiptLayer.inventoryStatus,
			receiptLayer.putawayArea
		HAVING MAX(
			CASE
				WHEN receiptLayer.cumulativeReceivedQuantity >= receiptLayer.quantityOnHand
					THEN receiptLayer.receiptTransactionDate
			END
		) IS NOT NULL
	) agedBalance
	WHERE (
		TO_DATE(:asOfDateTime, 'YYYY-MM-DD HH24:MI:SS')
		- TO_DATE(
				TO_CHAR(agedBalance.agingStartDate, 'YYYY-MM-DD'),
				'YYYY-MM-DD'
		)
			) * 24 >= :minimumAgingHours
		ORDER BY
		agedBalance.agingStartDate,
		agedBalance.quantityOnHand DESC,
		agedBalance.location,
		agedBalance.item,
		agedBalance.binNumber
)
WHERE ROWNUM <= :maxRows
