var injected, currentUrl;

function inject() {
    chrome.tabs.executeScript(null,{file:"script.js"});
}

chrome.webNavigation.onCompleted.addListener(function(details) {
    inject();
});
