SELECT *
FROM (
    SELECT t.id AS id, t.tranid AS tranid, t.type AS type, t.trandate AS trandate
    FROM Transaction t
    WHERE t.tranid = :transactionReference
    ORDER BY t.id
)
WHERE ROWNUM <= 6
