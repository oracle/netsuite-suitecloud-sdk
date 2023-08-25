define(['./ShopperInstance'], function (Shopper) {
    /**
     * Webstore shopper module.
     *
     * @module N/commerce/webstore/shopper
     * @public
     * @NApiVersion 2.x
     *
     */
    var shopper = function () { };

    /**
     * Returns a shopper.Shopper object that represents the properties and preferences for the current webstore shopper
     * executing the script.
     * @governance none
     * @return {Shopper}
     *
     * @since 2020.2
     */
    shopper.prototype.getCurrentShopper = function () { };

    /**
     * Gets the new customer record which will be associated with the current shopper when successfully saved.
     * @governance none
     * @return {Record}
     *
     * @since 2020.2
     */
    shopper.prototype.createCustomer = function () { };

    /**
     * Gets the new guest customer record which will be associated with the current guest shopper when successfully saved.
     * @governance none
     * @return {Record}
     *
     * @since 2021.2
     */
    shopper.prototype.createGuest = function () { };

    /**
     * Gets the currently logged in customer.
     * @governance none
     * @return {Record}
     *
     * @since 2020.2
     */
    shopper.prototype.getCurrentCustomer = function () { };

    /**
     * @exports N/commerce/webstore/shopper
     * @namespace shopper
     */
    return new shopper();
});