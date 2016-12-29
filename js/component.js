var Component = {
    content : null,
    artist : null,
    album : null,
    folder : null,
    size: 0,
    progress: 0,
    zip: null
};

function alertDownload (res) {
    Component.content = res;
    if (res && res.struct && res.struct.trackinfo) {
        Component.artist = Component.content.struct.artist;
        Component.album = Component.content.struct.current.title;
        chrome.pageAction.setTitle({"tabId":res.tabId,"title":"Download " + Component.artist + ' - ' + Component.album});
        chrome.pageAction.onClicked.addListener(startDownloadAlbum);
        chrome.notifications.create({
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': res.struct.albumart,
            "message": "Click here to download " + Component.artist + ' - ' + Component.album
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
    Component.zip = new JSZip();
    Component.folder = Component.zip.folder(Component.artist).folder(Component.album);
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
            Component.folder.file(this.arguments, this.response);
            if (++Component.progress == Component.size) {
                downloadZip()
            }
        };
        xhr.send(null);
    }
}

function downloadZip() {
    Component.zip.generateAsync({type:"blob"}).then(
        function(content) {
            saveAs(content, Component.artist + ' - ' + Component.album + ".zip");
        }
    );
    chrome.pageAction.show(Component.tabId);
}