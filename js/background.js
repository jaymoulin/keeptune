if (chrome && chrome.webNavigation && chrome.tabs) {
    chrome.pageAction.onClicked.addListener(startDownload);
    chrome.notifications.onClicked.addListener(startDownload);

    chrome.webNavigation.onCompleted.addListener(
        function (e) {
            if (e.url.indexOf('http') === 0) {
                chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId, "url": e.url}, null, initCallback);
            }
        }
    );
}
