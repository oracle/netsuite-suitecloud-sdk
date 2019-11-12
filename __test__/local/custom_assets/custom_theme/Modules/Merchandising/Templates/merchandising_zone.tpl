{{!--
 Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

<aside class="merchandising-zone">
	<h3> {{translate zoneTitle}}</h3>
	{{#if isZoneDescription}}
		<p class="merchandising-zone-description"> {{zoneDescription}} </p>
	{{/if}}

	<div class="merchandising-zone-container">
		<div data-view="Zone.Items"></div>
	</div>
</aside>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
