var Component = {
    content : null
};

function alertDownload (res) {
    Component.content = res;
    if (res.trackinfo) {
        chrome.notifications.create({
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': res.albumart,
            "message": "Click here to download "
        });
    }
}
