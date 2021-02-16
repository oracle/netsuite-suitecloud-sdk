{{!--
 Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

<tr id="{{lineId}}" data-item-id="{{itemId}}" data-type="order-item" {{#if showGeneralClass}} class="{{generalClass}}" {{/if}} >
	<td class="transaction-line-views-cell-actionable-table-first">
		<div class="transaction-line-views-cell-actionable-thumbnail">
			{{#if isFreeGift}}
	    		<span class="transaction-line-views-cell-actionable-free-badge">{{translate 'FREE'}}</span>
	    	{{/if}}
			{{#if isNavigable}}
				<a {{{linkAttributes}}}>
					<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
				</a>
			{{else}}
				<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
			{{/if}}
		</div>
	</td>
	<td class="transaction-line-views-cell-actionable-table-middle">
		<div class="transaction-line-views-cell-actionable-name">
		{{#if isNavigable}}
			<a {{{linkAttributes}}} class="transaction-line-views-cell-actionable-name-link">
				{{item._name}}
			</a>
		{{else}}
				<span class="transaction-line-views-cell-actionable-name-viewonly">{{item._name}}</span>
		{{/if}}
		</div>
		{{#unless isFreeGift}}
		<div class="transaction-line-views-cell-actionable-price">
			<div data-view="Item.Price"></div>
		</div>
	    {{/unless}}
		<div data-view="Item.Sku"></div>
		<div data-view="Item.Tax.Info"></div>
		<div class="transaction-line-views-cell-actionable-options">
			<div data-view="Item.SelectedOptions"></div>
		</div>
		{{#if showSummaryView}}
			<div class="transaction-line-views-cell-actionable-summary" data-view="Item.Summary.View"></div>
		{{/if}}
		<div class="transaction-line-views-cell-actionable-stock" data-view="ItemViews.Stock.View">
		</div>

		<div data-view="StockDescription"></div>
	</td>
	<td class="transaction-line-views-cell-actionable-table-last">
		<div data-view="Item.Actions.View"></div>

		{{#if showAlert}}
			<div class="transaction-line-views-cell-actionable-alert-placeholder" data-type="alert-placeholder"></div>
		{{/if}}

		{{#if showCustomAlert}}
			<div class="alert alert-{{customAlertType}}">
				{{item._cartCustomAlert}}
			</div>
		{{/if}}
	</td>
</tr>

