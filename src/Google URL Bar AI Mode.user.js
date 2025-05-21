// ==UserScript==
// @name         Google URL Bar AI Mode
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Adds udm=50&aep=11 to Google web searches from URL bar/external, not from Google-originated searches.
// @author       You
// @match        https://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    const query = params.get('q');
    if (!query) return;
    const tbmValue = params.get('tbm');
    if (tbmValue && tbmValue !== '') return;
    if (params.get('udm') === '50' && params.get('aep') === '11') return;
    let applyAiTags = false;
    if (!document.referrer) {
        applyAiTags = true;
    } else {
        try {
            const referrerUrl = new URL(document.referrer);
            if (referrerUrl.hostname.indexOf('google.') === -1) {
                applyAiTags = true;
            }
        } catch (e) {
            applyAiTags = false;
        }
    }
    if (applyAiTags) {
        const newSearchUrl = `https://www.google.com/search?udm=50&aep=11&q=${encodeURIComponent(query)}`;
        if (window.location.href !== newSearchUrl) {
            window.location.href = newSearchUrl;
        }
    }
})();