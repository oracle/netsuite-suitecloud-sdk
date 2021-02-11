{{!--
 Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

{{#if showTax}}
<div class="transaction-line-views-tax">
	<span class="transaction-line-views-tax-label">{{translate 'Taxes:'}}</span>
	<span class="transaction-line-views-tax-amount-value">{{taxAmount}}</span>
	<span class="transaction-line-views-tax-rate-value">( {{taxRate}} )</span>
</div>
{{/if}}