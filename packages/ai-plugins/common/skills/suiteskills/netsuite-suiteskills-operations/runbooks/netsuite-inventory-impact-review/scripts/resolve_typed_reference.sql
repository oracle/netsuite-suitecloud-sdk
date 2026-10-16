SELECT *
FROM (
    SELECT
    	transaction.id AS id,
    	transaction.tranid AS tranid,
    	transaction.type AS type,
    	transaction.trandate AS trandate
    FROM Transaction transaction
    WHERE transaction.type = :transactionTypeCode
    	AND transaction.tranid = :transactionReference
    ORDER BY transaction.id
)
WHERE ROWNUM <= 6
