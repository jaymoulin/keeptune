if (chrome && chrome.webNavigation) {
    chrome.webNavigation.onCompleted.addListener(
        e => chrome.tabs.sendMessage(e.tabId, {}, null, alertDownload),
        {url: [{urlMatches: '://.*\.bandcamp\.com/(album/.*|releases)'}]}
    );
}
