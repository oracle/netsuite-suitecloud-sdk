/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

define('vendor.ExtTest.module2', ['vendor.ExtTest.module2.View'], function(module2View) {
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
					return new module2View({ container: container });
				});
			}
		},
	};
});
