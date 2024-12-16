// ==UserScript==
// @name         Kagi Webpage Summarizer
// @namespace    https://github.com/mallochio
// @version      0.4
// @description  Summarize webpage content using Kagi Summarizer
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-end
// @inject-into  content
// ==/UserScript==

(function() {
    'use strict';
    
    function addSummarizerButton() {
        if (document.getElementById('kagi-summarizer-button')) return;
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'kagi-summarizer-button';
        infoDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: rgba(66, 133, 244, 0.15);
            border: 1px solid rgba(66, 133, 244, 0.6);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: rgba(66, 133, 244, 0.9);
            text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8), 0px 0px 3px rgba(0, 0, 0, 0.3);
            opacity: 0.75;
            transition: opacity 0.2s;
            cursor: pointer;
            z-index: 9999;
        `;
        infoDiv.textContent = 'K';
        infoDiv.title = "Summarize with Kagi";
        
        infoDiv.addEventListener('click', openKagiSummarizer);
        
        infoDiv.addEventListener('mouseover', () => infoDiv.style.opacity = '1');
        infoDiv.addEventListener('mouseout', () => infoDiv.style.opacity = '0.75');
        
        document.body.appendChild(infoDiv);
    }
    
    function openKagiSummarizer() {
        try {
            const currentUrl = encodeURIComponent(window.location.href);
            window.open(`https://kagi.com/summarizer/?target_language=&summary=takeaway&url=${currentUrl}`, '_blank');
        } catch (error) {
            console.error('Error opening Kagi Summarizer:', error);
        }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(addSummarizerButton, 100);
    } else {
        window.addEventListener('DOMContentLoaded', addSummarizerButton);
    }
})();