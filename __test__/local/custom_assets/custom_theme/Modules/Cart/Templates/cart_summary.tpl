<div data-cms-area="cart_summary_cms_area_1" data-cms-area-filters="path"></div>

<div class="cart-summary">
	<div class="cart-summary-container">
		<h3 class="cart-summary-title">
			{{translate 'Order Summary'}}
		</h3>

		{{#if isPriceEnabled}}
			<div class="cart-summary-subtotal">
				<p class="cart-summary-grid-float">
					<span class="cart-summary-amount-subtotal">
						{{ summary.subtotal_formatted }}
					</span>
						{{#if isSingleItem}}
							{{translate 'Subtotal <span class="cart-summary-item-quantity-subtotal">$(0) item</span>'itemCount}}
						{{else}}
							{{translate 'Subtotal <span class="cart-summary-item-quantity-subtotal">$(0) items</span>' itemCount}}
						{{/if}}
				</p>
				{{#if showEstimate}}
					<div class="cart-summary-subtotal-legend">
						{{translate 'Subtotal does not include shipping or tax'}}
					</div>
				{{/if}}
			</div>

			<div data-view="CartPromocodeListView"></div>

			{{#if showDiscountTotal}}
				<div class="cart-summary-discount-applied">
					<p class="cart-summary-grid-float">
						<span class="cart-summary-amount-discount-total">
							{{summary.discounttotal_formatted}}
						</span>
							{{translate 'Discount Total'}}
					</p>
				</div>
			{{/if}}

			{{#if showGiftCertificates}}
				<div class="cart-summary-giftcertificate-applied">
					<h5 class="cart-summary-giftcertificate-applied-title">
						{{translate 'Gift Certificates Applied ($(0))' giftCertificates.length}}
					</h5>
					<div data-view="GiftCertificates"></div>
				</div>
			{{/if}}

			{{#if showPickupInStoreLabel}}
				<div class="cart-summary-pickup-container">
					<p class="cart-summary-grid-float">
						{{translate 'Pick Up'}}
						<span class="cart-summary-pickup-label-free"> {{translate 'FREE'}}</span>
					</p>
				</div>
			{{/if}}

			{{#unless areAllItemsPickupable}}
				{{#if showEstimate}}
					<div class="cart-summary-expander-container">
						<div class="cart-summary-expander-head">
							<a class="cart-summary-expander-head-toggle collapsed" data-toggle="collapse" data-target="#estimate-shipping-form" aria-expanded="false" aria-controls="estimate-shipping-form">
								{{translate 'Estimate Tax &amp; Shipping'}} <i data-toggle="tooltip" class="cart-summary-expander-tooltip" title="{{translate '<b>Shipping Estimator</b><br>Shipping fees are based on your shipping location. Please enter your information to view estimated shipping costs.'}}" ></i><i class="cart-summary-expander-toggle-icon"></i>
							</a>
						</div>
						<div class="cart-summary-expander-body collapse" id="estimate-shipping-form" role="tabpanel">
							<div class="cart-summary-expander-container">
								<form action="#" data-action="estimate-tax-ship">
									{{#if singleCountry}}
										<span>{{translate 'Ship available only to $(0)' singleCountryName}}</span>
										<input name="country" id="country" class="country" value="{{singleCountryCode}}" type="hidden"/>
									{{else}}
										<div class="control-group">
											<label class="cart-summary-label" for="country">{{translate 'Select Country'}}</label>
											<select name="country" id="country" class="cart-summary-estimate-input country" data-action="estimate-tax-ship-country">
												{{#each countries}}
													<option value="{{code}}" {{#if selected}}selected{{/if}}>{{name}}</option>
												{{/each}}
											</select>
										</div>
									{{/if}}
									{{#if isZipCodeRequire}}
										<div data-validation="control-group">
											<label for="zip" class="cart-summary-label">
												{{#if isDefaultCountryUS}}
													{{translate 'Ship to the following zip code'}}
												{{else}}
													{{translate 'Ship to the following postal code'}}
												{{/if}}
											</label>
											<div data-validation="control">
												<input type="text" name="zip" id="zip" class="cart-summary-zip-code" value="{{shippingZipCode}}" />
											</div>
										</div>
									{{/if}}
									<button class="cart-summary-button-estimate">{{translate 'Estimate'}}</button>
								</form>
							</div>
						</div>
					</div>
				{{else}}
					{{#if hasShippingAddrress}}
						<div class="cart-summary-shipping-cost-applied">
							<div class="cart-summary-grid">
								<div class="cart-summary-label-shipto">
									{{translate 'Ship to:'}}
									<span class="cart-summary-label-shipto-success">{{shipToText}}</span>
									<a href="#" data-action="remove-shipping-address">
										<span class="cart-summary-remove-action"><i></i></span>
									</a>
								</div>
							</div>
							<p class="cart-summary-grid-float">
								<span class="cart-summary-amount-shipping">
									{{summary.shippingcost_formatted}}
								</span>
									{{translate 'Shipping'}}
							</p>

							{{#if showHandlingCost}}
							<p class="cart-summary-grid-float">
								<span class="cart-summary-amount-handling">
									{{summary.handlingcost_formatted}}
								</span>
									{{translate 'Handling'}}
							</p>
							{{/if}}

							{{#if summary.taxtotal}}
							<p class="cart-summary-grid-float">
								<span class="cart-summary-amount-tax">
									{{summary.taxtotal_formatted}}
								</span>
								{{translate taxLabel}}
							</p>
							{{/if}}

							{{#if summary.tax2total}}
							<p class="cart-summary-grid-float">
								<span class="cart-summary-amount-tax">
									{{summary.tax2total_formatted}}
								</span>
								{{translate 'PST'}}
							</p>
							{{/if}}

						</div>

						<div class="cart-summary-total">
							<p class="cart-summary-grid-float">
								<span class="cart-summary-amount-total">
									{{summary.total_formatted}}
								</span>
									{{#if showLabelsAsEstimated}}
										{{translate 'Estimated Total'}}
									{{else}}
										{{translate 'Total'}}
									{{/if}}
							</p>
						</div>
					{{else}}
						<div class="cart-summary-subtotal-legend">
							{{translate 'Subtotal does not include shipping or tax'}}
						</div>	
					{{/if}}
				{{/if}}
			{{/unless}}
		{{else}}
			<div class="cart-summary-message cart-summary-msg-description">
				<p class="cart-summary-login-to-see-price">
					{{translate 'Please <a href="$(0)">log in</a> to see prices or purchase items' urlLogin}}
				</p>
			</div>
		{{/if}}
	</div>

	<div data-cms-area="cart_summary_cms_area_2" data-cms-area-filters="path"></div>

	{{#if showPromocodeForm}}
		<div class="cart-summary-grid cart-summary-promocode-container">
			<div class="cart-summary-expander-head">
				<a class="cart-summary-expander-head-toggle collapsed" data-toggle="collapse" data-target="#promo-code-container" aria-expanded="false" aria-controls="promo-code-container">
							{{translate 'Have a Promo Code?'}}
							<i data-toggle="tooltip" class="cart-summary-expander-tooltip" title="{{translate '<b>Promo Code</b><br>To redeem a promo code, simply enter your information and we will apply the offer to your purchase during checkout.'}}"></i>
							<i class="cart-summary-expander-toggle-icon-promocode"></i>
				</a>
			</div>
			<div class="cart-summary-expander-body collapse" role="form" id="promo-code-container" aria-expanded="false">
				<div data-view="Cart.PromocodeFrom"></div>
			</div>
		</div>
	{{/if}}

	{{#if showActions}}
		<div class="cart-summary-button-container">
			<a id="btn-proceed-checkout" class="cart-summary-button-proceed-checkout {{#if showProceedButton}} cart-summary-button-proceed-checkout-sb {{/if}}" href="#" data-touchpoint="checkout" data-hashtag="#">
				{{translate 'Proceed to Checkout'}}
			</a>

			{{#if showPaypalButton}}
				<div class="cart-summary-btn-paypal-express">
					<a href="#" data-touchpoint="checkout" data-hashtag="#" data-parameters="paypalexpress=T">
						<img src="{{paypalButtonImageUrl}}" class="cart-summary-btn-paypal-express-image" alt="PayPal Express" />
					</a>
				</div>
			{{/if}}

			{{#if isWSDK}}
				<a class="cart-summary-continue-shopping" href="{{continueURL}}">
					{{translate 'Continue Shopping'}}
				</a>
			{{/if}}
		</div>
	{{/if}}
</div>

<div data-cms-area="cart_summary_cms_area_3" data-cms-area-filters="path"></div>


{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.addresses (Array)
	model.addresses.0 (Object)
	model.addresses.0.zip (String)
	model.addresses.0.country (String)
	model.addresses.0.company (undefined)
	model.addresses.0.internalid (String)
	model.shipmethods (Array)
	model.lines (Array)
	model.lines.0 (Object)
	model.lines.0.item (Object)
	model.lines.0.item.internalid (Number)
	model.lines.0.item.type (String)
	model.lines.0.quantity (Number)
	model.lines.0.internalid (String)
	model.lines.0.options (Array)
	model.lines.0.location (String)
	model.lines.0.fulfillmentChoice (String)
	model.paymentmethods (Array)
	model.internalid (String)
	model.confirmation (Object)
	model.confirmation.addresses (Array)
	model.confirmation.shipmethods (Array)
	model.confirmation.lines (Array)
	model.confirmation.paymentmethods (Array)
	model.multishipmethods (Array)
	model.lines_sort (Array)
	model.lines_sort.0 (String)
	model.latest_addition (undefined)
	model.promocodes (Array)
	model.ismultishipto (Boolean)
	model.shipmethod (undefined)
	model.billaddress (undefined)
	model.shipaddress (String)
	model.isPaypalComplete (Boolean)
	model.touchpoints (Object)
	model.touchpoints.logout (String)
	model.touchpoints.customercenter (String)
	model.touchpoints.serversync (String)
	model.touchpoints.viewcart (String)
	model.touchpoints.login (String)
	model.touchpoints.welcome (String)
	model.touchpoints.checkout (String)
	model.touchpoints.continueshopping (String)
	model.touchpoints.home (String)
	model.touchpoints.register (String)
	model.touchpoints.storelocator (String)
	model.agreetermcondition (Boolean)
	model.summary (Object)
	model.summary.discounttotal_formatted (String)
	model.summary.taxonshipping_formatted (String)
	model.summary.taxondiscount_formatted (String)
	model.summary.itemcount (Number)
	model.summary.taxonhandling_formatted (String)
	model.summary.total (Number)
	model.summary.tax2total (Number)
	model.summary.discountedsubtotal (Number)
	model.summary.taxtotal (Number)
	model.summary.discounttotal (Number)
	model.summary.discountedsubtotal_formatted (String)
	model.summary.taxondiscount (Number)
	model.summary.handlingcost_formatted (String)
	model.summary.taxonshipping (Number)
	model.summary.taxtotal_formatted (String)
	model.summary.totalcombinedtaxes_formatted (String)
	model.summary.handlingcost (Number)
	model.summary.totalcombinedtaxes (Number)
	model.summary.giftcertapplied_formatted (String)
	model.summary.shippingcost_formatted (String)
	model.summary.discountrate (String)
	model.summary.taxonhandling (Number)
	model.summary.tax2total_formatted (String)
	model.summary.discountrate_formatted (String)
	model.summary.estimatedshipping (Number)
	model.summary.subtotal (Number)
	model.summary.shippingcost (Number)
	model.summary.estimatedshipping_formatted (String)
	model.summary.total_formatted (String)
	model.summary.giftcertapplied (Number)
	model.summary.subtotal_formatted (String)
	model.options (Object)
	isWSDK (Boolean)
	continueURL (String)
	showActions (Boolean)
	showLabelsAsEstimated (Boolean)
	summary (Object)
	summary.discounttotal_formatted (String)
	summary.taxonshipping_formatted (String)
	summary.taxondiscount_formatted (String)
	summary.itemcount (Number)
	summary.taxonhandling_formatted (String)
	summary.total (Number)
	summary.tax2total (Number)
	summary.discountedsubtotal (Number)
	summary.taxtotal (Number)
	summary.discounttotal (Number)
	summary.discountedsubtotal_formatted (String)
	summary.taxondiscount (Number)
	summary.handlingcost_formatted (String)
	summary.taxonshipping (Number)
	summary.taxtotal_formatted (String)
	summary.totalcombinedtaxes_formatted (String)
	summary.handlingcost (Number)
	summary.totalcombinedtaxes (Number)
	summary.giftcertapplied_formatted (String)
	summary.shippingcost_formatted (String)
	summary.discountrate (String)
	summary.taxonhandling (Number)
	summary.tax2total_formatted (String)
	summary.discountrate_formatted (String)
	summary.estimatedshipping (Number)
	summary.subtotal (Number)
	summary.shippingcost (Number)
	summary.estimatedshipping_formatted (String)
	summary.total_formatted (String)
	summary.giftcertapplied (Number)
	summary.subtotal_formatted (String)
	itemCount (Number)
	isSingleItem (Boolean)
	isZipCodeRequire (Boolean)
	showEstimate (Boolean)
	showHandlingCost (Boolean)
	showGiftCertificates (Boolean)
	showPromocodeForm (Boolean)
	giftCertificates (Array)
	showDiscountTotal (Boolean)
	defaultCountry (String)
	isDefaultCountryUS (Boolean)
	countries (Array)
	singleCountry (Boolean)
	singleCountryCode (String)
	shipToText (String)
	singleCountryName (String)
	shippingZipCode (String)
	showPaypalButton (Boolean)
	paypalButtonImageUrl (String)
	showProceedButton (Boolean)
	urlLogin (String)
	isPriceEnabled (Boolean)
	showPickupInStoreLabel (Boolean)
	areAllItemsPickupable (Boolean)

----}}
