SELECT *
FROM (
    SELECT
    	transactionLineLink.nextDoc AS purchaseOrderId,
    	transactionLineLink.nextLine AS purchaseOrderLineId,
    	transactionLineLink.previousDoc AS salesOrderId,
    	transactionLineLink.previousDoc AS salesOrder,
    	BUILTIN.DF(transactionLineLink.previousDoc) AS salesOrderDisplay,
    	transactionLineLink.previousLine AS salesOrderLine,
    	BUILTIN.DF(transactionLineLink.linkType) AS linkType,
    	transactionLineLink.quantityLinked AS quantityLinked
    FROM PreviousTransactionLineLink transactionLineLink
    WHERE transactionLineLink.nextDoc IN (:purchaseOrderIds)
    	AND transactionLineLink.previousType = 'SalesOrd'
    	AND transactionLineLink.linkType IN ('DropShip', 'SpecOrd')
    ORDER BY
    	transactionLineLink.nextDoc,
    	transactionLineLink.nextLine,
    	transactionLineLink.previousDoc,
    	transactionLineLink.previousLine
)
WHERE ROWNUM <= 500
