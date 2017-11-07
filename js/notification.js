function fbShare(url, title, descr, image, winWidth, winHeight) {
  var winTop = (screen.height / 2) - (winHeight / 2);
  var winLeft = (screen.width / 2) - (winWidth / 2);
  window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}

function twitterShare(text, url) {
  window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url));
}

function onButtonClicked(notificationId, buttonIndex) {
  if (notificationId != 'share-on-social') return;

  if (buttonIndex == 0) {
    fbShare("https://chrome.google.com/webstore/detail/nmoobgpmablfmgchfjnhkbloaobiogeh", "Bandcamp Downloader", "Download music via bandcamp.", "", 600, 400);
    if (ga) {
      ga('send', {
        hitType: 'event',
        eventCategory: "share",
        eventAction: "facebook",
        eventLabel: "clicked"
      });
    }
  }

  if (buttonIndex == 1) {
    twitterShare("bandcamp.com downloader for #chrome browser... Worth trying...", "https://chrome.google.com/webstore/detail/nmoobgpmablfmgchfjnhkbloaobiogeh");
    if (ga) {
      ga('send', {
        hitType: 'event',
        eventCategory: "share",
        eventAction: "twitter",
        eventLabel: "clicked"
      });
    }
  }
};

function showNotification() {
  chrome.notifications.create('share-on-social', {
    type: 'basic',
    iconUrl: '/icons/64.png',
    title: 'Share Bandcamp Downloader with your friends?',
    message: 'Thank you for being awasome user!',
    requireInteraction: true,
    buttons: [{
        title: 'Share on Facebook',
        iconUrl: '/icons/fb.png'
      },
      {
        title: 'Share on Twitter',
        iconUrl: '/icons/twitter.png'
      }
    ]
  }, function callback(notificationId) {});

  if (ga) {
    ga('send', {
      hitType: 'event',
      eventCategory: "share",
      eventAction: "notification",
      eventLabel: "displayed"
    });
  }
}

chrome.notifications.onButtonClicked.addListener(onButtonClicked);

chrome.storage.local.get('lasttimedisplayedshare', function (res) {
  if (res.lasttimedisplayedshare) {
    var time = (new Date().getTime() - res.lasttimedisplayedshare) / 3600000;
    if (time >= 720) {
      showNotification();
      chrome.storage.local.set({
        'lasttimedisplayedshare': new Date().getTime()
      });
    }
  } else {
    chrome.storage.local.set({
      'lasttimedisplayedshare': new Date().getTime()
    });
  }
});