if (chrome && chrome.runtime && chrome.webNavigation && chrome.tabs) {
    chrome.pageAction.onClicked.addListener(startDownload);
    chrome.notifications.onClicked.addListener(startDownload);

    chrome.runtime.onInstalled.addListener(function(details){
        chrome.notifications.create('UPDATEBNDCMPDOWN', {
            'title': "Bandcamp Downloader update/install",
            'type': "basic",
            'iconUrl': 'icons/128.png',
            "message": "This extension will be sold to another company. Hope you enjoyed this extension and you'll follow my work on github.com/jaymoulin!"
        });
    });

    chrome.webNavigation.onCompleted.addListener(
        function (e) {
            if (e.url.indexOf('http') === 0) {
                chrome.tabs.sendMessage(e.tabId, {"tabId": e.tabId, "url": e.url}, null, initCallback);
            }
        }
    );
}
