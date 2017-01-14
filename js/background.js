if (chrome && chrome.webNavigation && chrome.tabs) {
    chrome.webNavigation.onCompleted.addListener(
        function (e) {
            var xhr = new XMLHttpRequest();
            if (e.url.indexOf('http') != -1) {
                xhr.open("GET", e.url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.getResponseHeader("Content-Type").indexOf('text/html') != -1) {
                        chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId}, null, alertDownload);
                    }
                };
                xhr.send();
            }
        }
    );
    chrome.tabs.onRemoved.addListener(
        function (tabId) {
            if (objList[tabId]) {
                delete objList[tabId];
            }
        }
    );
}
