/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

define('vendor.ExtTest.module1', ['vendor.ExtTest.module1.View'], function(ExtTestView) {
	'use strict';

	return {
		mountToApp: function mountToApp(container) {
			// using the 'Layout' component we add a new child view inside the 'Header' existing view
			// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
			// more documentation of the Extensibility API in
			// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html

			/** @type {LayoutComponent} */
			const layout = container.getComponent('Layout');

			if (layout) {
				layout.addChildView('Header.Logo', function() {
					return new ExtTest1View({ container: container });
				});
			}
		},
	};
});
