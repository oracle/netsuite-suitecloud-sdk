/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// @module vendor.ExtTest.module2
define('vendor.ExtTest.module2.View', ['vendor_exttest_module2.tpl', 'Utils', 'View'], function(vendor_exttest_module2_tpl, Utils, View) {
	'use strict';

	return View.extend({
		template: vendor_exttest_module2_tpl,

		initialize: function(options) {},

		events: {},

		bindings: {},

		childViews: {},

		//@method getContext @return vendor.ExtTest.module2.View.Context
		getContext: function getContext() {
			//@class vendor.ExtTest.module2.View.Context
			this.message = this.message || 'Hello World!!';
			return {
				message: this.message,
			};
		},
	});
});
