SELECT item, itemDisplay, quantityOnHand, location, locationDisplay,
       bin, binDisplay, putawayArea
FROM (
    SELECT ib.item AS item, BUILTIN.DF(ib.item) AS itemDisplay,
           ib.quantityOnHand AS quantityOnHand,
           ib.location AS location, BUILTIN.DF(ib.location) AS locationDisplay,
           ib.binNumber AS bin, BUILTIN.DF(ib.binNumber) AS binDisplay,
           CASE WHEN ib.binNumber IS NULL THEN 'RECEIVING_AREA'
                ELSE 'INBOUND_STAGING' END AS putawayArea
    FROM InventoryBalance ib
    LEFT JOIN Bin b ON b.id = ib.binNumber
    WHERE ib.quantityOnHand > 0
      AND (ib.binNumber IS NULL OR b.type = 'INBOUND_STAGING')
      AND (:putawayAreaScope = 'ALL'
           OR (:putawayAreaScope = 'NO_BIN' AND ib.binNumber IS NULL)
           OR (:putawayAreaScope = 'INBOUND_STAGING'
               AND ib.binNumber IS NOT NULL AND b.type = 'INBOUND_STAGING'))
      AND (:locationScope = 'ALL' OR ib.location IN (:locationIds))
      AND (:itemScope = 'ALL' OR ib.item IN (:itemIds))
      AND (:binScope = 'ALL' OR ib.binNumber IN (:binIds))
    ORDER BY ib.location, ib.item, ib.binNumber, ib.inventoryNumber,
             ib.inventoryStatus, ib.quantityOnHand DESC
)
WHERE ROWNUM <= :maxRows
