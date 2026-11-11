SELECT
	itemId,
	locationId,
	itemId AS item,
	BUILTIN.DF(itemId) AS itemDisplay,
	locationId AS location,
	BUILTIN.DF(locationId) AS locationDisplay,
	binId AS bin,
	BUILTIN.DF(binId) AS binDisplay,
	inventoryNumberId AS inventoryNumber,
	BUILTIN.DF(inventoryNumberId) AS inventoryNumberDisplay,
	quantityOnHand,
	quantityAvailable,
	exceptionReason
FROM (
	SELECT
		inventoryBalance.item AS itemId,
		inventoryBalance.location AS locationId,
		inventoryBalance.binNumber AS binId,
		inventoryBalance.inventoryNumber AS inventoryNumberId,
		inventoryBalance.quantityOnHand AS quantityOnHand,
		inventoryBalance.quantityAvailable AS quantityAvailable,
		CASE
			WHEN NVL(inventoryBalance.quantityOnHand, 0) < 0 THEN 'Negative on hand'
			WHEN NVL(inventoryBalance.quantityAvailable, 0) < 0 THEN 'Negative available'
			ELSE 'Review'
		END AS exceptionReason
	FROM InventoryBalance inventoryBalance
	WHERE (
		NVL(inventoryBalance.quantityOnHand, 0) < 0
		OR NVL(inventoryBalance.quantityAvailable, 0) < 0
	)
		AND (
			:locationScope = 'ALL'
			OR inventoryBalance.location IN (:locationIds)
		)
		AND (
			:itemScope = 'ALL'
			OR inventoryBalance.item IN (:itemIds)
		)
	ORDER BY
		CASE
			WHEN NVL(inventoryBalance.quantityOnHand, 0) < 0 THEN 0
			ELSE 1
		END,
		LEAST(
			NVL(inventoryBalance.quantityOnHand, 0),
			NVL(inventoryBalance.quantityAvailable, 0)
		),
		inventoryBalance.location,
		inventoryBalance.item,
		inventoryBalance.binNumber
)
WHERE ROWNUM <= :maxRows
