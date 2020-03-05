{{!--
 Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

<tr id="{{lineId}}" data-item-id="{{itemId}}" data-type="order-item" {{#if showGeneralClass}} class="{{generalClass}}" {{/if}} >
	<td class="transaction-line-views-cell-actionable-expanded-table-first">
		<div class="transaction-line-views-cell-actionable-expanded-thumbnail">
			{{#if isNavigable}}
				<a {{{linkAttributes}}}>
					<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
				</a>
			{{else}}
				<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
			{{/if}}
		</div>
	</td>
	<td class="transaction-line-views-cell-actionable-expanded-table-middle">
		<div class="transaction-line-views-cell-actionable-expanded-name">
		{{#if isNavigable}}
			<a {{{linkAttributes}}} class="transaction-line-views-cell-actionable-expanded-name-link">
				{{item._name}}
			</a>
		{{else}}
				<span class="transaction-line-views-cell-actionable-expanded-name-viewonly">{{item._name}}</span>
		{{/if}}
		</div>
		<div class="transaction-line-views-cell-actionable-expanded-price">
			<div data-view="Item.Price"></div>
		</div>
		<div data-view="Item.Sku"></div>
		<div class="transaction-line-views-cell-actionable-expanded-options">
			<div data-view="Item.SelectedOptions"></div>
		</div>
		<div class="transaction-line-views-cell-actionable-expanded-stock" data-view="ItemViews.Stock.View">
		</div>

		<div data-view="StockDescription"></div>
	</td>
	<td class="transaction-line-views-cell-actionable-expanded-table-middle">
		{{#if showSummaryView}}
			<div class="transaction-line-views-cell-actionable-expanded-summary" data-view="Item.Summary.View"></div>
		{{/if}}
	</td>
	<td class="transaction-line-views-cell-actionable-expanded-table-last">
		<div data-view="Item.Actions.View"></div>

		{{#if showAlert}}
			<div class="transaction-line-views-cell-actionable-expanded-alert-placeholder" data-type="alert-placeholder"></div>
		{{/if}}

		{{#if showCustomAlert}}
			<div class="alert alert-{{customAlertType}}">
				{{item._cartCustomAlert}}
			</div>
		{{/if}}
	</td>
</tr>


