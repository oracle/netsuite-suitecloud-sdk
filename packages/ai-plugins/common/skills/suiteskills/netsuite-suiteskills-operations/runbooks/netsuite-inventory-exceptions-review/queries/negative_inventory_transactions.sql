SELECT *
FROM (
    SELECT
    	latestTransaction.itemId,
    	latestTransaction.locationId,
    	transactionRecord.id AS transactionId,
    	BUILTIN.DF(transactionLine.transaction) AS transactionDisplay,
    	transactionRecord.tranid AS transactionNumber,
    	transactionRecord.trandate AS transactionDate,
    	transactionRecord.recordType AS transactionType,
    	transactionLine.quantity AS movementQuantity
    FROM (
    	SELECT
    		transactionLine.item AS itemId,
    		transactionLine.location AS locationId,
    		transactionRecord.id AS transactionId,
    		transactionLine.id AS transactionLineId,
    		ROW_NUMBER() OVER (
    			PARTITION BY
    				transactionLine.item,
    				transactionLine.location
    			ORDER BY
    				transactionRecord.trandate DESC,
    				transactionRecord.id DESC,
    				transactionLine.id DESC
    		) AS latestTransactionRank
    	FROM Transaction transactionRecord
    	JOIN TransactionLine transactionLine
    		ON transactionLine.transaction = transactionRecord.id
    	WHERE NVL(transactionLine.mainline, 'F') = 'F'
    		AND NVL(transactionLine.taxline, 'F') = 'F'
    		AND NVL(transactionLine.isInventoryAffecting, 'F') = 'T'
    		AND transactionLine.item IN (:itemIds)
    		AND transactionLine.location IN (:locationIds)
    ) latestTransaction
    JOIN Transaction transactionRecord
    	ON transactionRecord.id = latestTransaction.transactionId
    JOIN TransactionLine transactionLine
    	ON transactionLine.transaction = latestTransaction.transactionId
    	AND transactionLine.id = latestTransaction.transactionLineId
    WHERE latestTransaction.latestTransactionRank = 1
    ORDER BY
    	latestTransaction.itemId,
    	latestTransaction.locationId
)
WHERE ROWNUM <= :maxRows
