	<tr class="item-{{itemId}}  {{#if isLineSelected}}transaction-line-views-cell-selectable-multishipto-line-selected{{/if}}" data-item-id="{{itemId}}" data-type="row" data-line-id="{{lineId}}"  data-action="select-unselected-item">
		<td class="transaction-line-views-cell-selectable-item-selector">
				<input data-type="checkbox-item-selector" type="checkbox" {{#if isLineSelected}}checked{{/if}} />
			</td>

			<td class="transaction-line-views-cell-selectable-item-image">
				<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
			</td>
			<td class="transaction-line-views-cell-selectable-item-details">

				<p class="transaction-line-views-cell-selectable-item-displayname">
					{{#if isNavigable}}
						<a {{{itemURLAttributes}}}>{{itemName}}</a>
					{{else}}
						<span class="transaction-line-views-cell-selectable-item-displayname-viewonly">{{itemName}}</span>
					{{/if}}
				</p>
				<div data-view="Item.Sku"></div>
				<p class="transaction-line-views-cell-selectable-stock" data-view="ItemViews.Stock.View">
				</p>

				<div data-view="StockDescription"></div>

				{{#if showOptions}}
					<div data-view="Item.Options"></div>
				{{/if}}
			</td>
			<td class="transaction-line-views-cell-selectable-item-qty">
					{{#if isDetail1Composite}}
					<div data-view="Detail1.View"></div>
				{{else}}
					{{#if showDetail1Title}}
						<span class="transaction-line-views-cell-selectable-visible-phone">{{detail1Title}}</span>
					{{/if}}
					{{detail1}}
				{{/if}}
			</td>
			<td class="transaction-line-views-cell-selectable-item-unit-price">
				<p>
				{{#if showDetail2Title}}
					<span class="transaction-line-views-cell-selectable-item-unit-price-label">{{detail2Title}}</span>
				{{/if}}
				<span class="transaction-line-views-cell-selectable-item-unit-price-value">
					{{detail2}}
				</span>
				</p>
			</td>
			<td class="transaction-line-views-cell-selectable-item-amount">
				<p>
				{{#if showDetail3Title}}
					<span class="transaction-line-views-cell-selectable-item-amount-label">{{detail3Title}}</span>
				{{/if}}
				<span class="transaction-line-views-cell-selectable-item-amount-value">
					{{detail3}}
				</span>
				</p>
			</td>
	</tr>




{{!----
Use the following context variables when customizing this template: 
	
	itemId (Number)
	itemType (String)
	itemName (String)
	lineId (String)
	rateFormatted (String)
	showOptions (Boolean)
	isNavigable (Boolean)
	itemURLAttributes (String)
	showDetail1Title (Boolean)
	detail1Title (String)
	isDetail1Composite (Boolean)
	showDetail2Title (Boolean)
	detail2Title (String)
	detail2 (String)
	showDetail3Title (Boolean)
	detail3Title (String)
	detail3 (String)
	thumbnail (Object)
	thumbnail.altimagetext (String)
	thumbnail.url (String)
	isLineSelected (Boolean)

----}}
