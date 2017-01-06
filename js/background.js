if (chrome && chrome.webNavigation && chrome.pageAction) {
    chrome.webNavigation.onCompleted.addListener(
        e => chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId}, null, alertDownload)
    );
    chrome.tabs.onRemoved.addListener(
        function (tabId) {
            if (objList[tabId]) {
                delete objList[tabId];
            }
        }
    );
}
