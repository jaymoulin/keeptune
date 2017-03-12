const DOWNLOAD_NOTIFICATION = 'DOWNLOAD_NOTIFICATION';
const PROGRESS_NOTIFICATION = 'PROGRESS_NOTIFICATION';

var objList = [];
class Component {
    constructor() {
        this.tabId = null;
        this.content = null;
        this.artist = null;
        this.album = null;
        this.folder = null;
        this.size = 0;
        this.progress = 0;
        this.retryTrack = [];
        this.zip = null;
        this.started = false;
    }
};

function alertDownload(res) {
    if (res && res.struct && res.struct.trackinfo) {
        chrome.pageAction.show(res.tabId);
        objList[res.url] = new Component;
        objList[res.url].tabId = res.tabId;
        objList[res.url].url = res.url;
        objList[res.url].content = res.struct;
        objList[res.url].artist = res.struct.artist;
        objList[res.url].album = res.struct.current.title;
        chrome.pageAction.setTitle({
            "tabId":res.tabId,
            "title":"Download " + objList[res.url].artist + ' - ' + objList[res.url].album
        });
        chrome.pageAction.onClicked.addListener(startDownloadAlbum);
        chrome.notifications.create(DOWNLOAD_NOTIFICATION + res.url, {
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': res.struct.albumart,
            "message": "Click here to download " + objList[res.url].artist + ' - ' + objList[res.url].album
        });
        chrome.notifications.onClicked.addListener(startDownloadAlbum);
    }
}

function startDownloadAlbum(notifId) {
    if (typeof (notifId) !== 'object' && notifId && notifId.indexOf(DOWNLOAD_NOTIFICATION) !== 0) {
        return;
    }
    let url = (typeof (notifId) == 'object') ? notifId.url : notifId.replace(DOWNLOAD_NOTIFICATION, '')
    if (objList[url].started) {
        return
    }
    chrome.notifications.clear(DOWNLOAD_NOTIFICATION + url);
    chrome.pageAction.hide(objList[url].tabId);
    chrome.notifications.create(PROGRESS_NOTIFICATION + url, {
        'title': "Downloading " + objList[url].artist + ' - ' + objList[url].album,
        'type': "progress",
        'iconUrl': objList[url].content.albumart,
        "message": "Initializing...",
        "progress": 1,
        "isClickable": false,
        "requireInteraction": true
    });
    objList[url].size = objList[url].content.trackinfo.length;
    objList[url].progress = 0;
    objList[url].started = true;
    objList[url].zip = new JSZip();
    objList[url].folder = objList[url].zip.folder(objList[url].artist).folder(objList[url].album);
    for(var i in objList[url].content.trackinfo) {
        var track = objList[url].content.trackinfo[i];
        var trackName = track.track_num + ' - ' + track.title + '.mp3';
        var trackUrl = '';
        for (var index in track.file) {
            trackUrl = track.file[index];
            break;
        }

        downloadProcess(url, trackUrl, trackName, i)
    }
}

function downloadProcess(url, trackUrl, trackName, trackId) {
    let retry = typeof(objList[url].retryTrack[trackId]) == 'undefined' ? 0 : objList[url].retryTrack[trackId]
    let xhr = new XMLHttpRequest();
    xhr.open("GET", 'https:' + trackUrl + '&retry=' + retry);
    xhr.responseType = "blob";
    xhr.arguments = {"trackName": trackName, "url":url, "trackId":trackId, "trackUrl": trackUrl};
    xhr.onload = function() {
        if (this.status === 200) {
            objList[this.arguments.url].folder.file(this.arguments.trackName, this.response);
        }
        if (this.status === 200 || objList[url].retryTrack[trackId] > 1) {
            objList[this.arguments.url].progress++
        }
        let progress = Math.round((objList[this.arguments.url].progress/(objList[this.arguments.url].size))*100);
        chrome.notifications.update(PROGRESS_NOTIFICATION + this.arguments.url, {
            "progress": progress < 0 ? 0 : (progress > 100 ? 100 : progress),
            "message": this.arguments.trackName + (this.status === 200 ? " downloaded!" : " errored !")
        });
        if (objList[this.arguments.url].progress == objList[this.arguments.url].size) {
            downloadZip(this.arguments.url);
        }
    };
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            chrome.notifications.create({
                'title': objList[this.arguments.url].artist + ' - ' + objList[this.arguments.url].album + " error while downloading!",
                'type': "basic",
                'iconUrl': objList[this.arguments.url].content.albumart,
                "message": "Error while downloading " + this.arguments.trackName + ' : ' + this.statusText
            });
            if (typeof(objList[this.arguments.url].retryTrack[this.arguments.trackId]) == 'undefined') {
                objList[this.arguments.url].retryTrack[this.arguments.trackId] = 1
                that = this
                setTimeout(function () {
                    downloadProcess(that.arguments.url, that.arguments.trackUrl, that.arguments.trackName, that.arguments.trackId)
                }, 4000)
            } else {
                objList[this.arguments.url].retryTrack[this.arguments.trackId]++
            }
        }
    };
    xhr.send(null);
}

function downloadZip(url) {
    chrome.pageAction.show(objList[url].tabId);
    objList[url].started = false;
    objList[url].zip.generateAsync({type:"blob"}).then(
        function(content) {
            chrome.notifications.clear(PROGRESS_NOTIFICATION+url);
            saveAs(content, objList[url].artist + ' - ' + objList[url].album + ".zip");
        }
    );
}
