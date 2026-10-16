SELECT t.id AS id, t.tranid AS tranid, t.type AS type, t.trandate AS trandate
FROM Transaction t
WHERE t.id = :transactionId
