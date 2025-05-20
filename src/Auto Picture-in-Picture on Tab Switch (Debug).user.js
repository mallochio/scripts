// ==UserScript==
// @name         Auto Picture-in-Picture on Tab Switch (Debug)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Automatically enters PiP when a tab with a playing video loses focus. (With more logging)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log("Auto PiP Script (Debug Version 0.4) Loaded");

    let lastPlayingVideo = null;
    let pipAttemptedForVideo = null; // To avoid repeated attempts on the same video if it fails

    // Function to find a playing video on the page
    function getPlayingVideo() {
        console.log("getPlayingVideo: Searching for videos...");
        const videos = Array.from(document.querySelectorAll('video'));
        console.log(`getPlayingVideo: Found ${videos.length} video element(s).`);

        for (const video of videos) {
            // Log detailed status of each video
            // console.log(`Video check: src=${video.src}, paused=${video.paused}, ended=${video.ended}, readyState=${video.readyState}, currentTime=${video.currentTime}, duration=${video.duration}, display=${getComputedStyle(video).display}, visibility=${getComputedStyle(video).visibility}, offsetWidth=${video.offsetWidth}`);
            if (video.src && video.readyState >= 2 && !video.paused && !video.ended && video.HAVE_FUTURE_DATA && video.offsetWidth > 0 && video.offsetHeight > 0) { // [3]
                console.log("getPlayingVideo: Found a playing video:", video);
                return video;
            }
        }
        console.log("getPlayingVideo: No actively playing video found meeting criteria.");
        return null;
    }

    // Function to attempt to enter PiP
    async function requestPiP(videoElement) {
        if (!videoElement) {
            console.log("requestPiP: No video element provided.");
            return;
        }
        console.log("requestPiP: Attempting for video:", videoElement);

        if (pipAttemptedForVideo === videoElement && document.pictureInPictureElement !== videoElement) {
            console.log("requestPiP: Already attempted PiP for this video recently without success, skipping for now.");
            // return; // You can uncomment this to prevent retries for a bit
        }

        if (document.pictureInPictureEnabled && !videoElement.disablePictureInPicture) { // [2]
            try {
                if (document.pictureInPictureElement === videoElement) {
                    console.log("requestPiP: Video is already in PiP.");
                    return;
                }
                console.log("requestPiP: Calling video.requestPictureInPicture()");
                await videoElement.requestPictureInPicture(); // [2, 4]
                console.log("requestPiP: Successfully entered PiP for:", videoElement);
                pipAttemptedForVideo = null; // Reset on success
            } catch (error) {
                console.error("requestPiP: PiP request failed:", error.name, error.message, error);
                pipAttemptedForVideo = videoElement; // Mark as attempted
                if (error.name === 'NotAllowedError') {
                    console.warn("PiP request failed: NotAllowedError. This often means the browser requires more significant user interaction with the page or video before PiP can be triggered programmatically (e.g., click to play the video, not just hover or autoplay). It can also happen if the document does not have focus.");
                } else if (error.name === 'InvalidStateError') {
                     console.warn("PiP request failed: InvalidStateError. This can happen if the video metadata isn't loaded yet, or the video is not eligible for PiP (e.g., no audio/video tracks, or too small).");
                }
            }
        } else {
            console.log("requestPiP: PiP not enabled in document or disabled on video element.");
            if (!document.pictureInPictureEnabled) console.log("document.pictureInPictureEnabled is false"); // [2]
            if (videoElement.disablePictureInPicture) console.log("videoElement.disablePictureInPicture is true");
        }
    }

    // Function to attempt to exit PiP
    async function exitPiP() {
        console.log("exitPiP: Attempting to exit PiP.");
        if (document.pictureInPictureEnabled && document.pictureInPictureElement) { // [2]
            try {
                await document.exitPictureInPicture(); // [2]
                console.log("exitPiP: Successfully exited PiP.");
            } catch (error) {
                console.error("exitPiP: PiP exit failed:", error);
            }
        } else {
            console.log("exitPiP: No PiP element to exit or PiP not enabled.");
        }
    }

    // Listen for visibility changes (tab switch, minimize)
    document.addEventListener('visibilitychange', async function() { // [1, 13]
        console.log(`visibilitychange: Document hidden status: ${document.hidden}`);
        const currentVideo = getPlayingVideo(); // Check for playing video *now*

        if (document.hidden) { // Tab has become hidden/inactive [1]
            console.log("visibilitychange: Tab became hidden.");
            if (currentVideo) {
                console.log("visibilitychange: Active video found on hidden tab. Storing and attempting PiP.");
                lastPlayingVideo = currentVideo;
                await requestPiP(lastPlayingVideo);
            } else {
                console.log("visibilitychange: No active video found on hidden tab.");
                // If a video was previously in PiP and is *still* our lastPlayingVideo, keep it.
                if (lastPlayingVideo && document.pictureInPictureElement === lastPlayingVideo) {
                    console.log("visibilitychange: Keeping previously PiP'd video in PiP mode.");
                }
            }
        } else { // Tab has become visible/active [1]
            console.log("visibilitychange: Tab became visible.");
            if (lastPlayingVideo && document.pictureInPictureElement === lastPlayingVideo) {
                console.log("visibilitychange: Tab is visible and our PiP video is active. Exiting PiP.");
                await exitPiP();
                lastPlayingVideo = null;
            } else if (document.pictureInPictureElement && !currentVideo) {
                // If something is in PiP but no video is actively playing on this tab now
                // (e.g. video ended, or it was from another tab and this tab was focused)
                console.log("visibilitychange: Tab is visible, a PiP window exists, but no video is playing on this tab OR it's not our tracked video. Exiting PiP.");
                await exitPiP(); // Exit any PiP when returning to a tab not actively playing the PiP'd video
                lastPlayingVideo = null;
            } else if (document.pictureInPictureElement && currentVideo && document.pictureInPictureElement !== currentVideo) {
                // A video is playing on the current tab, but a *different* video is in PiP. Exit the old PiP.
                console.log("visibilitychange: A new video is playing on this tab, but a different one is in PiP. Exiting old PiP.");
                await exitPiP();
                lastPlayingVideo = null; // Reset, as the context has changed.
            } else {
                 console.log("visibilitychange: Tab became visible. No specific PiP action needed based on lastPlayingVideo.");
            }
        }
    });

    document.addEventListener('play', function(event) {
        if (event.target.tagName === 'VIDEO' && !document.hidden) {
            console.log("Event: 'play' detected for video:", event.target);
            // Potentially set this as a candidate if no video was playing before
            // if (!lastPlayingVideo) lastPlayingVideo = event.target;
        }
    }, true);

    document.addEventListener('pause', async function(event) {
        if (event.target.tagName === 'VIDEO' && document.pictureInPictureElement === event.target) {
            console.log("Event: 'pause' detected for PiP video:", event.target);
            if (event.target.ended) {
                console.log("PiP video ended. Exiting PiP.");
                await exitPiP();
                if (lastPlayingVideo === event.target) lastPlayingVideo = null;
            } else {
                 console.log("PiP video paused by user. Currently keeping it in PiP.");
            }
        }
    }, true);

})();