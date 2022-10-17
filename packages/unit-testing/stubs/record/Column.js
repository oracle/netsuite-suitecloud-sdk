define([], function () {
    /**
     * @protected
     * @constructor
     */
    function Column() {
        this.label = undefined;

        this.id = undefined;

        this.isDisabled = undefined;

        this.isMandatory = undefined;

        this.type = undefined;

        this.sublistId = undefined;
    }

    return new Column();
});
