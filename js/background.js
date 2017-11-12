function setupGoogleAnalytics() {
  if (!window.ga) {
    (function() {
      (window.ga = function() {
        (window.ga.q = window.ga.q || []).push(arguments);
      }),
        (window.ga.l = 1 * new Date());
      var tag = "script";
      var a = document.createElement(tag);
      var m = document.getElementsByTagName(tag)[0];
      a.async = 1;
      a.src = "https://www.google-analytics.com/analytics.js";
      m.parentNode.insertBefore(a, m);
    })();
    ga("create", "UA-105690710-3", "auto");
    ga("set", "checkProtocolTask", function() {});
    ga("send", "pageview", "/background.html");
  }
}

setupGoogleAnalytics();

if (chrome && chrome.webNavigation && chrome.tabs) {
  chrome.pageAction.onClicked.addListener(startDownload);
  chrome.notifications.onClicked.addListener(startDownload);

  chrome.webNavigation.onCompleted.addListener(function(e) {
    if (e.url.indexOf("http") === 0) {
      chrome.tabs.sendMessage(
        e.tabId,
        { tabId: e.tabId, url: e.url },
        null,
        initCallback
      );
    }
  });
}

chrome.runtime.onInstalled.addListener(function(es) {
  chrome.storage.local.set({ lasttimedisplayedshare: new Date().getTime() });
  chrome.storage.local.set({ time: new Date().getTime() });
  ga("send", {
    hitType: "event",
    eventCategory: es.reason,
    eventAction: es.previousVersion
  });
});
