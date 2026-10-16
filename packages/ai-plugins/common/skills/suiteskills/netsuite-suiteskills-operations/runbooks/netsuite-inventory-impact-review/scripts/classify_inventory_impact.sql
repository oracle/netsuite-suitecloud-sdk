SELECT
	CASE
		WHEN COUNT(*) = 0 THEN 'NO_ACCESSIBLE_MATCHING_DATA'
		WHEN COUNT(CASE WHEN transactionLine.isInventoryAffecting = 'T' THEN 1 END) > 0 THEN 'IMPACTING'
		WHEN COUNT(CASE WHEN transactionLine.isInventoryAffecting = 'F' THEN 1 END) = COUNT(*) THEN 'NOT_IMPACTING'
		ELSE 'IMPACT_EVIDENCE_UNAVAILABLE'
	END AS status,
	COUNT(*) AS matchingLineCount,
	COUNT(CASE WHEN transactionLine.isInventoryAffecting = 'T' THEN 1 END) AS inventoryAffectingLineCount,
	COUNT(*) - COUNT(CASE WHEN transactionLine.isInventoryAffecting IN ('T', 'F') THEN 1 END) AS unavailableImpactFlagCount
FROM TransactionLine transactionLine
WHERE transactionLine.transaction = :transactionId
	AND (
		:transactionLineScope = 'ALL'
		OR (
			:transactionLineScope = 'SELECTED'
			AND transactionLine.id IN (:transactionLineIds)
		)
	)
