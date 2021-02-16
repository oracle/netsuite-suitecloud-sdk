{{!--
 Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
--}}

<section class="module1-info-card">
    <span class="module1-info-card-content">
      {{message}}
    </span>
</section>


<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension
  
  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder
  
  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme
  
  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->