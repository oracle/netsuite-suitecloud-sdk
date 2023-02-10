define(['./CurrentRecordInstance'], function (CurrentRecord) {
    /**
     * SuiteScript for Current Record Module
     *
     * @module N/currentRecord
     * @suiteScriptVersion 2.x
     *
     */
    var currentRecord = function () { };

    /**
     * @return {CurrentRecord}
     */
    currentRecord.prototype.get = function () { };
    currentRecord.prototype.get.promise = function () { };

    /**
     * @exports N/currentRecordBootstrap
     * @namespace currentRecordBootstrap
     */
    return new currentRecord();
});