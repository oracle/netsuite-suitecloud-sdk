{{#each rates}}
<div class="global-views-rating-by-star" data-id="stars{{index}}">
  <ul>
    <li class="global-views-rating-by-star-label">
      {{#if showLink}}
        <a href="{{url}}" class="global-views-rating-by-star-link">
      {{/if}}
        
        {{#if @last}}
          {{translate '1 star'}}
        {{else}}
          {{translate '$(0) stars' index}}
        {{/if}}

      {{#if showLink}}
        </a>
      {{/if}}
    </li>
    <li class="global-views-rating-by-star-percentage-area">
      <div class="global-views-rating-by-star-percentage-area-progress-bar">
        <div class="global-views-rating-by-star-percentage-area-progress-bar-filled" style="width: {{percentage}}%;">
        </div>
      </div>
    </li>
    <li class="global-views-rating-by-star-second-label">

      {{#if showLink}}
        <a href="{{url}}" class="global-views-rating-by-star-link">
      {{/if}}
        
        {{#if ../showCount}}
          <span class="global-views-rating-by-star-label-count">
            {{#if isOneReview}}
              {{translate '1 review'}}
            {{else}}
              {{translate '$(0) reviews' count}}
            {{/if}}
          </span>
        {{/if}}

      {{#if showLink}}
        </a>
      {{/if}}
    </li>
  </ul>  
</div>
{{/each}}



{{!----
Use the following context variables when customizing this template: 
	
	showCount (Boolean)
	showPercentage (Boolean)
	rates (Array)

----}}
