var Component = {
    content : null,
    size: 0,
    progress: 0,
};

function alertDownload (res) {
    Component.content = res;
    if (res && res.struct && res.struct.trackinfo) {
        chrome.pageAction.setTitle({"tabId":res.tabId,"title":"Download"});
        chrome.pageAction.onClicked.addListener(startDownloadAlbum);
        chrome.notifications.create({
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': res.struct.albumart,
            "message": "Click here to download "
        });
        chrome.notifications.onClicked.addListener(startDownloadAlbum);
    }
}

function startDownloadAlbum(notifId) {
    if (notifId) {
        chrome.notifications.clear(notifId);
    }
    chrome.pageAction.hide(Component.content.tabId);
    Component.size = Component.content.struct.trackinfo.length;
    Component.progress = 0;
    for(var i in Component.content.struct.trackinfo) {
        var track = Component.content.struct.trackinfo[i];
        var trackName = track.track_num + ' - ' + track.title + '.mp3';
        var url = '';
        for (var index in track.file) {
            url = track.file[index];
            break;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https:' + url);
        xhr.responseType = "blob";
        xhr.arguments = trackName;
        xhr.onload = function() {
            console.log(this.response);
            console.log(this.arguments);
            if (++Component.progress == Component.size) {
                downloadZip()
            }
        };
        xhr.send(null);
    }
}

function downloadZip() {
    alert('Zip down');
}