// ==UserScript==
// @name         Redirect arXiv to AlphaXiv
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Redirects arXiv abstract pages to AlphaXiv.
// @author       Your Name
// @match        *://arxiv.org/abs/*
// @match        *://arxiv.org/pdf/*
// @match        *://arxiv.org/html/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function redirect() {
        const currentUrl = new URL(location.href);
        const pathname = currentUrl.pathname; // e.g., /abs/2305.12345 or /pdf/2305.12345.pdf

        let arxivId = '';

        if (pathname.startsWith('/abs/')) {
            arxivId = pathname.substring(5); // Remove '/abs/'
        } else if (pathname.startsWith('/pdf/')) {
            arxivId = pathname.substring(5); // Remove '/pdf/'
            // Remove .pdf if it exists
            if (arxivId.toLowerCase().endsWith('.pdf')) {
                arxivId = arxivId.substring(0, arxivId.length - 4);
            }
        }
        if (pathname.startsWith('/html/')) {
            arxivId = pathname.substring(5); // Remove '/html/'
        }

        if (arxivId) {
            // Construct the AlphaXiv URL for the abstract page
            const alphaXivUrl = `https://alphaxiv.org/abs/${arxivId}`;
            location.href = alphaXivUrl;
        }
    }

    // No need for 'urlchange' listener for this specific redirection as arXiv loads a new page for each abstract.
    // The @match directive and initial run should cover it.
    redirect();
})();