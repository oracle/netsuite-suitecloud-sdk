/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export function getTimestamp(): string {
	const dateNow = new Date();
	const datePartsArray = [dateNow.getFullYear(), dateNow.getMonth() + 1, dateNow.getDate()].map(date => date.toString().length === 1 ? "0" + date : date);
	const timePartsArray = [dateNow.getHours(), dateNow.getMinutes(), dateNow.getSeconds()].map(time => time.toString().length === 1 ? "0" + time : time);

	return datePartsArray.join("-") + " " + timePartsArray.join(":");
}
