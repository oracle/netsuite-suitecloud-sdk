SELECT
	item AS item,
	BUILTIN.DF(item) AS itemDisplay,
	lotNumber AS lotNumber,
	BUILTIN.DF(lotNumber) AS lotNumberDisplay,
	TO_CHAR(expirationDate, 'YYYY-MM-DD') AS expirationDate,
	daysToExpiry,
	quantityOnHand,
	quantityAvailable,
	location AS location,
	BUILTIN.DF(location) AS locationDisplay,
	binNumber AS bin,
	BUILTIN.DF(binNumber) AS binDisplay,
	expirationStatus
FROM (
	SELECT
		inventoryBalance.item AS item,
		inventoryBalance.inventoryNumber AS lotNumber,
		inventoryNumber.expirationDate AS expirationDate,
		TRUNC(inventoryNumber.expirationDate)
			- TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD')) AS daysToExpiry,
		SUM(NVL(inventoryBalance.quantityOnHand, 0)) AS quantityOnHand,
		SUM(NVL(inventoryBalance.quantityAvailable, 0)) AS quantityAvailable,
		inventoryBalance.location AS location,
		inventoryBalance.binNumber AS binNumber,
		CASE
			WHEN TRUNC(inventoryNumber.expirationDate) < TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD'))
				THEN 'Expired'
			ELSE 'At risk of expiry'
		END AS expirationStatus
	FROM InventoryBalance inventoryBalance
	JOIN InventoryNumber inventoryNumber
		ON inventoryNumber.id = inventoryBalance.inventoryNumber
	JOIN Item item
		ON item.id = inventoryBalance.item
	WHERE NVL(item.isLotItem, 'F') = 'T'
		AND inventoryNumber.expirationDate IS NOT NULL
		AND TRUNC(inventoryNumber.expirationDate)
			<= TRUNC(TO_DATE(:asOfDate, 'YYYY-MM-DD')) + 1
		AND (
			:locationScope = 'ALL'
			OR inventoryBalance.location IN (:locationIds)
		)
		AND (
			:itemScope = 'ALL'
			OR inventoryBalance.item IN (:itemIds)
		)
		AND (
			:inventoryNumberScope = 'ALL'
			OR inventoryBalance.inventoryNumber IN (:inventoryNumberIds)
		)
		AND (
			:binScope = 'ALL'
			OR inventoryBalance.binNumber IN (:binIds)
		)
		AND (
			:expirationDateScope = 'ALL'
			OR (
				:expirationDateScope = 'FROM'
				AND TRUNC(inventoryNumber.expirationDate)
					>= TRUNC(TO_DATE(:expirationDateFrom, 'YYYY-MM-DD'))
			)
			OR (
				:expirationDateScope = 'THROUGH'
				AND TRUNC(inventoryNumber.expirationDate)
					<= TRUNC(TO_DATE(:expirationDateTo, 'YYYY-MM-DD'))
			)
			OR (
				:expirationDateScope = 'RANGE'
				AND TRUNC(inventoryNumber.expirationDate)
					BETWEEN TRUNC(TO_DATE(:expirationDateFrom, 'YYYY-MM-DD'))
						AND TRUNC(TO_DATE(:expirationDateTo, 'YYYY-MM-DD'))
			)
		)
	GROUP BY
		inventoryBalance.item,
		inventoryBalance.inventoryNumber,
		inventoryNumber.expirationDate,
		inventoryBalance.location,
		inventoryBalance.binNumber
	HAVING SUM(NVL(inventoryBalance.quantityOnHand, 0)) > 0
		AND (
			:quantityOnHandScope = 'ALL'
			OR (
				:quantityOnHandScope = 'MINIMUM'
				AND SUM(NVL(inventoryBalance.quantityOnHand, 0)) >= :minimumQuantityOnHand
			)
			OR (
				:quantityOnHandScope = 'RANGE'
				AND SUM(NVL(inventoryBalance.quantityOnHand, 0))
					BETWEEN :minimumQuantityOnHand AND :maximumQuantityOnHand
			)
		)
	ORDER BY
		TRUNC(inventoryNumber.expirationDate),
		SUM(NVL(inventoryBalance.quantityOnHand, 0)) DESC,
		inventoryBalance.location,
		inventoryBalance.item,
		inventoryBalance.inventoryNumber,
		inventoryBalance.binNumber
)
WHERE ROWNUM <= :maxRows
