SELECT item, itemDisplay, quantityOnHand, location, locationDisplay,
       bin, binDisplay, putawayArea
FROM (
    SELECT ib.item AS item, BUILTIN.DF(ib.item) AS itemDisplay,
           ib.quantityOnHand AS quantityOnHand,
           ib.location AS location, BUILTIN.DF(ib.location) AS locationDisplay,
           ib.binNumber AS bin, NULL AS binDisplay,
           'RECEIVING_AREA' AS putawayArea
    FROM InventoryBalance ib
    WHERE ib.quantityOnHand > 0
      AND ib.binNumber IS NULL
      AND (:locationScope = 'ALL' OR ib.location IN (:locationIds))
      AND (:itemScope = 'ALL' OR ib.item IN (:itemIds))
    ORDER BY ib.location, ib.item, ib.binNumber, ib.inventoryNumber,
             ib.inventoryStatus, ib.quantityOnHand DESC
)
WHERE ROWNUM <= :maxRows
