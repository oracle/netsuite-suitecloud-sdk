{{#if isCreditCards}}
	{{#if isVisaMasterOrDiscoverAvailable}}
		<p>{{translate 'VISA/Mastercard/Discover'}}</p>
		<p><img src="{{getThemeAssetsPathWithDefault imageCvvAllCardsURL 'img/cvv_all_cards.jpg'}}" alt=""></p>
	{{/if}}
	
	{{#if isAmexAvailable}}
		<p>{{translate 'American Express'}}</p>
		<p><img src="{{getThemeAssetsPathWithDefault imageCvvAmericanCardURL 'img/cvv_american_card.jpg'}}" alt=""></p>
	{{/if}}
{{else}}
	<p>{{translate 'VISA/Mastercard/Discover'}}</p>
	<p><img src="{{getThemeAssetsPathWithDefault imageCvvAllCardsURL 'img/cvv_all_cards.jpg'}}" alt=""></p>

	<p>{{translate 'American Express'}}</p>
	<p><img src="{{getThemeAssetsPathWithDefault imageCvvAmericanCardURL 'img/cvv_american_card.jpg'}}" alt=""></p>
{{/if}}






{{!----
Use the following context variables when customizing this template: 
	
	isCreditCards (Boolean)
	availableCreditcards (Array)
	imageCvvAmericanCardURL (String)
	imageCvvAllCardsURL (String)
	isVisaMasterOrDiscoverAvailable (Boolean)
	isAmexAvailable (Boolean)

----}}
