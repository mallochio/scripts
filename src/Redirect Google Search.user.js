// ==UserScript==
// @name         Redirect Google Search
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Redirects Google searches entered via URL to Perplexity AI.
// @author       Your Name
// @match        *://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        // Check if the query is already a Perplexity URL (to avoid redirect loops if Perplexity itself uses Google search for something)
        if (!currentUrl.includes('perplexity.ai')) {
            const perplexityUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
            window.location.replace(perplexityUrl);
        }
    }
})();