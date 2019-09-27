{{#if showTax}}
<div class="transaction-line-views-tax">
	<span class="transaction-line-views-tax-label">{{translate 'Taxes:'}}</span>
	<span class="transaction-line-views-tax-amount-value">{{taxAmount}}</span>
	<span class="transaction-line-views-tax-rate-value">( {{taxRate}} )</span>
</div>
{{/if}}