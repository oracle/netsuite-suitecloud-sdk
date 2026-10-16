SELECT
	transactionRecord.id AS transactionId,
	transactionRecord.id AS transactionIdReference
FROM Transaction transactionRecord
WHERE transactionRecord.id IN (:transactionIds)
ORDER BY
	transactionRecord.id
