{{#if isPriceEnabled}}
<div class="transaction-line-views-price">
	<span class="transaction-line-views-price-exact" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
		<meta itemprop="priceCurrency" content="{{currencyCode}}"/>
		<span class="transaction-line-views-price-lead" itemprop="price" data-rate="{{rateFormatted}}">
			{{rateFormatted}}
	</span>
		{{#if showComparePrice}}
			<small class="transaction-line-views-price-old">
				{{comparePriceFormatted}}
			</small>
		{{/if}}
		<link itemprop="availability" href="{{#if isInStock}}https://schema.org/InStock{{else}}https://schema.org/OutOfStock{{/if}}"/>
	</span>
</div>
{{else}}
	<div class="transaction-line-views-price-login-to-see-prices">
		<p class="transaction-line-views-price-message">
			{{translate '<a href="$(0)">Log in</a> to see price' urlLogin}}
		</p>
	</div>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.internalid (String)
	model.options (Array)
	model.shipaddress (undefined)
	model.shipmethod (undefined)
	model.location (String)
	model.fulfillmentChoice (String)
	showComparePrice (Boolean)
	isInStock (Boolean)
	currencyCode (String)
	comparePriceFormatted (String)
	price (Number)
	priceFormatted (String)
	isPriceEnabled (Boolean)
	urlLogin (String)
	rateFormatted (String)

----}}
