module.exports = {
    mockModules: function() {
        return {
            "N/record": path.resolve(__dirname, "mocks", "record.js"),
            "InternalRecord": path.resolve(__dirname, "mocks", "InternalRecord.js"),
            "Line": path.resolve(__dirname, "mocks", "Line.js"),
            "Sublist": path.resolve(__dirname, "mocks", "Sublist.js")
        }
    }
};