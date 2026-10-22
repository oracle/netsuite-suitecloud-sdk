SELECT
	fulfillment.id AS itemFulfillmentId,
	fulfillment.tranId AS tranId,
	CASE fulfillment.status
		WHEN 'A' THEN 'A'
		WHEN 'B' THEN 'B'
		WHEN 'C' THEN 'C'
	END AS statusCode,
	BUILTIN.DF(fulfillment.status) AS statusName,
	fulfillment.orderType AS orderType,
	BUILTIN.DF(source.id) AS sourceTransaction,
	source.id AS sourceTransactionId,
	BUILTIN.DF(fulfillment.location) AS fulfillmentLocation,
	fulfillment.location AS locationId,
	CASE WHEN timings.pickedDate >= source.createdDate
		THEN ROUND((timings.pickedDate - source.createdDate) * 86400)
	END AS sourceCreationToPickSeconds,
	CASE WHEN timings.packedDate >= source.createdDate
		THEN ROUND((timings.packedDate - source.createdDate) * 86400)
	END AS sourceCreationToPackSeconds,
	CASE WHEN timings.shippedDate >= source.createdDate
		THEN ROUND((timings.shippedDate - source.createdDate) * 86400)
	END AS sourceCreationToShipSeconds,
	ROUND((timings.packedDate - timings.pickedDate) * 86400) AS pickToPackSeconds,
	ROUND((timings.shippedDate - timings.pickedDate) * 86400) AS pickToShipSeconds,
	ROUND((timings.shippedDate - timings.packedDate) * 86400) AS packToShipSeconds,
	TO_CHAR(source.createdDate, 'YYYY-MM-DD HH24:MI:SS') AS sourceTransactionCreationTimestamp,
	TO_CHAR(timings.pickedDate, 'YYYY-MM-DD HH24:MI:SS') AS pickedTimestamp,
	TO_CHAR(timings.packedDate, 'YYYY-MM-DD HH24:MI:SS') AS packedTimestamp,
	TO_CHAR(timings.shippedDate, 'YYYY-MM-DD HH24:MI:SS') AS shippedTimestamp,
	CASE WHEN timings.itemFulfillmentId IS NULL
		THEN 'POPULATION_TOO_LARGE'
	END AS resultStatus
FROM (
	SELECT
		packed.itemFulfillmentId,
		packed.pickedDate,
		packed.packedDate,
		CASE WHEN packed.shippedDate < COALESCE(packed.packedDate, packed.pickedDate)
			THEN TO_DATE(NULL)
			ELSE packed.shippedDate
		END AS shippedDate
	FROM (
		SELECT
			selected.itemFulfillmentId,
			selected.pickedDate,
			CASE WHEN selected.packedDate < selected.pickedDate
				THEN TO_DATE(NULL)
				ELSE selected.packedDate
			END AS packedDate,
			selected.shippedDate
		FROM (
			SELECT
				statusTransitions.itemFulfillmentId,
				TO_DATE(TO_CHAR(
					MAX(CASE WHEN statusTransitions.status = 'A' THEN statusTransitions.dateTime END),
					'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS pickedDate,
				TO_DATE(TO_CHAR(
					MAX(CASE WHEN statusTransitions.status = 'B' THEN statusTransitions.dateTime END),
					'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS packedDate,
				TO_DATE(TO_CHAR(
					MAX(CASE WHEN statusTransitions.status = 'C' THEN statusTransitions.dateTime END),
					'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS shippedDate
			FROM (
				SELECT
					selectedFulfillments.itemFulfillmentId,
					history.status,
					history.dateTime,
					(SELECT prior.status FROM TransactionHistory prior
                        WHERE prior.internalId = history.internalId
                          AND prior.type = history.type
                          AND prior.action IN ('CREATE', 'CHANGE')
                          AND prior.version = (
                            SELECT MAX(earlier.version) FROM TransactionHistory earlier
                            WHERE earlier.internalId = history.internalId
                              AND earlier.type = history.type
                              AND earlier.action IN ('CREATE', 'CHANGE')
                              AND earlier.version < history.version)) AS previousStatus
				FROM (
					SELECT
						CASE WHEN candidates.eligibleCount <= 50000
							THEN candidates.itemFulfillmentId
						END AS itemFulfillmentId
					FROM (
						SELECT
							candidate.id AS itemFulfillmentId,
							(SELECT COUNT(*) FROM (SELECT counted.id FROM ItemFulfillment counted WHERE (:filterByItemFulfillments = 'F'
								OR counted.id IN (:itemFulfillmentIds))
							AND (:filterByLocations = 'F'
								OR counted.location IN (:locationIds))
							AND (:filterByDate = 'F'
								OR (counted.createdDate >= TO_DATE(:startDate, 'YYYY-MM-DD')
									AND counted.createdDate < TO_DATE(:endDate, 'YYYY-MM-DD') + 1))
							AND (:shippedOnly = 'F' OR counted.status = 'C')
							AND (:salesAndTransferOnly = 'F' OR counted.orderType IN ('SalesOrd', 'TrnfrOrd'))
							AND ROWNUM <= 50001)) AS eligibleCount
						FROM ItemFulfillment candidate
						WHERE (:filterByItemFulfillments = 'F'
								OR candidate.id IN (:itemFulfillmentIds))
							AND (:filterByLocations = 'F'
								OR candidate.location IN (:locationIds))
							AND (:filterByDate = 'F'
								OR (candidate.createdDate >= TO_DATE(:startDate, 'YYYY-MM-DD')
									AND candidate.createdDate < TO_DATE(:endDate, 'YYYY-MM-DD') + 1))
							AND (:shippedOnly = 'F' OR candidate.status = 'C')
							AND (:salesAndTransferOnly = 'F' OR candidate.orderType IN ('SalesOrd', 'TrnfrOrd'))
							AND ROWNUM <= 50001
					) candidates
					WHERE candidates.eligibleCount <= 50000 OR ROWNUM = 1
				) selectedFulfillments
				LEFT JOIN TransactionHistory history
					ON history.internalId = selectedFulfillments.itemFulfillmentId
					AND history.type = 'ItemShip'
					AND history.action IN ('CREATE', 'CHANGE')
			) statusTransitions
			WHERE statusTransitions.previousStatus IS NULL
				OR statusTransitions.previousStatus <> statusTransitions.status
			GROUP BY statusTransitions.itemFulfillmentId
		) selected
	) packed
) timings
LEFT JOIN ItemFulfillment fulfillment ON fulfillment.id = timings.itemFulfillmentId
LEFT JOIN (
	SELECT
		sourceTransaction.id,
		TO_DATE(TO_CHAR(sourceTransaction.createdDate, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS createdDate
	FROM Transaction sourceTransaction
) source ON source.id = fulfillment.createdFrom
ORDER BY itemFulfillmentId
