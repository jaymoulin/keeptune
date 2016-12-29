if (chrome && chrome.webNavigation && chrome.pageAction) {
    chrome.webNavigation.onCompleted.addListener(
        function (e) {
            chrome.pageAction.show(e.tabId);
            chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId}, null, alertDownload);
        },
        {url: [{urlMatches: '://.*\.bandcamp\.com/(album/.*|releases)'}]}
    );
    chrome.tabs.onRemoved.addListener(
        function (tabId) {
            if (objList[tabId]) {
                delete objList[tabId];
            }
        }
    );
}
