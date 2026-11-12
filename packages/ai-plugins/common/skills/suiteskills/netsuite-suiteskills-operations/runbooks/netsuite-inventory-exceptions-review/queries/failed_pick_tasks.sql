SELECT
	pickActionId,
	pickTaskId,
	pickTaskNumber,
	pickTaskUrl,
	relatedTransaction,
	wave,
	location,
	item,
	bin,
	detailInventoryNumber,
	taskInventoryNumber,
	picker,
	units,
	pickTaskStatus,
	pickActionStatus,
	failureReason,
	taskQuantity,
	pickedQuantity,
	allowRetry
FROM (
	SELECT
		pickAction.id AS pickActionId,
		pickTask.id AS pickTaskId,
		pickTask.name AS pickTaskNumber,
		'/app/accounting/wms/picktask/picktask.nl?id=' || TO_CHAR(pickTask.id) AS pickTaskUrl,
		pickAction.orderNumber AS relatedTransaction,
		pickTask.wave AS wave,
		pickTask.location AS location,
		pickTask.item AS item,
		pickDetail.bin AS bin,
		pickDetail.inventoryNumber AS detailInventoryNumber,
		pickTask.inventoryNumber AS taskInventoryNumber,
		pickTask.picker AS picker,
		pickTask.units AS units,
		BUILTIN.DF(pickTask.status) AS pickTaskStatus,
		BUILTIN.DF(pickAction.status) AS pickActionStatus,
		BUILTIN.DF(pickAction.failureReason) AS failureReason,
		pickAction.quantity AS taskQuantity,
		pickAction.pickedQuantity AS pickedQuantity,
		pickAction.allowRetry AS allowRetry
	FROM PickTask pickTask
	JOIN PickAction pickAction
		ON pickAction.pickTask = pickTask.id
	LEFT JOIN PickActionInventoryDetail pickDetail
		ON pickDetail.pickAction = pickAction.id
	WHERE pickAction.status = 'FAILED'
		AND (:locationScope = 'ALL' OR pickTask.location IN (:locationIds))
		AND (:itemScope = 'ALL' OR pickTask.item IN (:itemIds))
	ORDER BY
		pickAction.orderNumber,
		pickTask.name,
		pickAction.id,
		pickDetail.id
)
WHERE ROWNUM <= :maxRows
