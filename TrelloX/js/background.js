var injected, currentUrl;

chrome.webNavigation.onCompleted.addListener(function(details) {
    inject();
});
