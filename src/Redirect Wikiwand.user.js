// ==UserScript==
// @name         Redirect Wikiwand
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Redirects Wikipedia articles to Wikiwand for a different viewing experience.
// @author       Your Name
// @match        *://*.wikipedia.org/wiki/*
// @run-at       document-start
// @grant        none
// @exclude      *://*.wikipedia.org/wiki/Main_Page
// @exclude      *://*.wikipedia.org/wiki/Wikipedia:*
// @exclude      *://*.wikipedia.org/wiki/Special:*
// @exclude      *://*.wikipedia.org/wiki/Help:*
// @exclude      *://*.wikipedia.org/wiki/Talk:*
// @exclude      *://*.wikipedia.org/wiki/User:*
// @exclude      *://*.wikipedia.org/wiki/User_talk:*
// @exclude      *://*.wikipedia.org/wiki/Template:*
// @exclude      *://*.wikipedia.org/wiki/Category:*
// @exclude      *://*.wikipedia.org/wiki/File:*
// @exclude      *://*.wikipedia.org/wiki/MediaWiki:*
// @exclude      *://*.wikipedia.org/wiki/Portal:*
// ==/UserScript==

(function() {
    'use strict';

    function redirect() {
        const currentUrl = new URL(location.href);
        const hostnameParts = currentUrl.hostname.split('.'); // e.g., ["en", "wikipedia", "org"]
        const pathname = currentUrl.pathname; // e.g., /wiki/Article_Name

        // Check if it's a standard article page
        // (avoids redirecting special pages, main page, etc.)
        if (pathname.startsWith('/wiki/')) {
            const articleName = pathname.substring(6); // Remove '/wiki/'
            const languageCode = hostnameParts[0]; // Assumes subdomain is the language code

            // Prevent redirecting away from Wikiwand if somehow a Wikipedia link is on Wikiwand
            if (currentUrl.hostname.includes('wikiwand.com')) {
                return;
            }

            // Construct the Wikiwand URL
            // Wikiwand uses the language code in the path
            const wikiwandUrl = `https://www.wikiwand.com/${languageCode}/${articleName}${currentUrl.search}${currentUrl.hash}`;
            location.href = wikiwandUrl;
        }
    }

    // Exclude specific Wikipedia namespaces that don't have direct Wikiwand equivalents
    // or where redirection is undesirable. The @exclude directives in the header
    // are generally more efficient for this.
    const excludedPaths = [
        "/wiki/Main_Page",
        "/wiki/Wikipedia:",
        "/wiki/Special:",
        "/wiki/Help:",
        "/wiki/Talk:",
        "/wiki/User:",
        "/wiki/User_talk:",
        "/wiki/Template:",
        "/wiki/Category:",
        "/wiki/File:",
        "/wiki/MediaWiki:",
        "/wiki/Portal:"
    ];

    for (const excluded of excludedPaths) {
        if (location.pathname.startsWith(excluded)) {
            return; // Don't redirect if it's an excluded path
        }
    }

    redirect();
})();