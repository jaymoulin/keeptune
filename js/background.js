if (chrome && chrome.webNavigation && chrome.tabs) {
    chrome.webNavigation.onCompleted.addListener(
        function (e) {
            if (typeof(objList[e.url]) != 'undefined') {
                chrome.pageAction.show(e.tabId);
            }
            if (e.url.indexOf('http') == 0) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", e.url, true);
                xhr.onload = function () {
                    if (xhr.getResponseHeader("Content-Type").indexOf('text/html') == 0 &&
                        typeof(objList[e.url]) == 'undefined' &&
                        xhr.responseText.indexOf('TralbumData') != -1
                    ) {
                        chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId, "url": e.url}, null, alertDownload);
                    }
                };
                xhr.send();
            }
        }
    );
}
