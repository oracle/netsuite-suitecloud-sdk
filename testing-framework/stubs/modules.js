/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

module.exports = {
	mockModules: function() {
		return {
			"N/record": path.resolve(__dirname, "mocks", "record.js"),
			"N/record/instance": path.resolve(__dirname, "mocks", "RecordInstance.js"),
			"N/record/instance/line": path.resolve(__dirname, "mocks", "RecordInstanceLine.js"),
			"N/record/instance/sublist": path.resolve(__dirname, "mocks", "RecordInstanceSublist.js")
		}
	}
};
