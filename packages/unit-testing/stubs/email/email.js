define([], function () {
    /**
     * SuiteScript email common module
     *
     * @module N/email
     * @suiteScriptVersion 2.x
     *
     */
    var email = function () { };

    /**
     * Sends email to an individual or group of recipients and receives bounceback notifications.
     *
     * @governance 20 units
     * @restriction The maximum number of total recipients (recipient + cc + bcc) allowed is 10
     *
     * @param {Object} options Email options
     * @param {number} options.author Sender of the email.
     * @param {number|string|Array<number|string>} options.recipients Recipients of the email, Internal ID or array of Email Addresses.
     * @param {number|string|Array<number|string>=} options.cc CC recipients of the email, Internal ID or array of Email Addresses.
     * @param {number|string|Array<number|string>=} options.bcc BCC recipients of the email as an EmailEntity, Internal ID or Email Address.
     * @param {string} options.subject Subject of the outgoing message.
     * @param {string} options.body Contents of the outgoing message.
     * @param {string} [options.replyTo] The email address that appears in the reply-to header.
     * @param {Array<file.File>} [options.attachments] Email file attachments. Not supported in client side.
     * @param {RelatedRecords} [options.relatedRecords] Object that contains key/value pairs to associate (attach) the Message record with related records (i.e., transaction, activity, entity, and custom records)
     * @param {boolean} [options.isInternalOnly] If true, the Message record is not visible to an external Entity (for example, a customer or contact). The default value is false.
     * @return {void}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some required argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when some argument's type is incorrect
     *
     * @since 2015.2
     *
     */
    email.prototype.send = function (options) { };
    email.prototype.send.promise = function (options) { };

    /**
     * Sends bulk email (for use when bounceback notification is not required).
     *
     * @governance 10 units
     * @restriction The maximum number of total recipients (recipient + cc + bcc) allowed is 10
     *
     * @param {Object} options Email options
     * @param {number} options.author Internal ID of the email sender.
     * @param {number|string|Array<number|string>} options.recipients Recipients of the email, Internal ID or array of Email Addresses.
     * @param {number|string|Array<number|string>=} options.cc CC recipients of the email, Internal ID or array of Email Addresses.
     * @param {number|string|Array<number|string>=} options.bcc BCC recipients of the email as an EmailEntity, Internal ID or Email Address.
     * @param {string} options.subject Subject of the outgoing message.
     * @param {string} options.body Contents of the outgoing message.
     * @param {string} [options.replyTo] The email address that appears in the reply-to header.
     * @param {Array<file.File>} [options.attachments] Email file attachments.  Not supported in client side.
     * @param {RelatedRecords} [options.relatedRecords] Object that contains key/value pairs to associate (attach) the Message record with related records (i.e., transaction, activity, entity, and custom records)
     * @param {boolean} [options.isInternalOnly] If true, the Message record is not visible to an external Entity (for example, a customer or contact). The default value is false.
     * @return {void}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some required argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when some argument's type is incorrect
     *
     * @since 2015.2
     *
     */
    email.prototype.sendBulk = function (options) { };
    email.prototype.sendBulk.promise = function (options) { };

    /**
     * Send a single "on-demand" campaign email to a specified recipient and return a campaign response ID to track the email
     * @governance 10 units
     *
     * @param {number} campaignEventId  The internal ID of the campaign event.
     * @param {number} recipientId The internal ID of the recipient. Note that the recipient must have an email.
     * @return {number} A campaign response ID (tracking code) as an integer. If the email fails to send, the value returned is -1.
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some required argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when some argument's type is incorrect
     *
     * @since 2015.2
     *
     */
    email.prototype.sendCampaignEvent = function (options) { };
    email.prototype.sendCampaignEvent.promise = function (options) { };

    /**
     * @exports N/email
     * @namespace email
     */
    return new email();
});