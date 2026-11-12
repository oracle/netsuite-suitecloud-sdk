SELECT *
FROM (
    SELECT
    	transactionLine.id AS lineId,
    	transactionLine.item AS item,
    	BUILTIN.DF(transactionLine.item) AS itemDisplay,
    	transactionLine.quantity AS quantityChanged,
    	transactionLine.inventoryReportingLocation AS location,
    	BUILTIN.DF(transactionLine.inventoryReportingLocation) AS locationDisplay
    FROM TransactionLine transactionLine
    WHERE transactionLine.transaction = :transactionId
    	AND (
    		:transactionLineScope = 'ALL'
    		OR (
    			:transactionLineScope = 'SELECTED'
    			AND transactionLine.id IN (:transactionLineIds)
    		)
    	)
    	AND transactionLine.isInventoryAffecting = 'T'
    ORDER BY transactionLine.id
)
WHERE ROWNUM <= 400
