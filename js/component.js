const DOWNLOAD_NOTIFICATION = 'DOWNLOAD_NOTIFICATION';
const PROGRESS_NOTIFICATION = 'PROGRESS_NOTIFICATION';
const COMPLETE_NOTIFICATION = 'COMPLETE_NOTIFICATION';

var objList = [];
let options = new Options;

class Component {
    constructor() {
        this.tabId = null;
        this.content = null;
        this.artist = null;
        this.album = null;
        this.folder = null;
        this.size = 0;
        this.progress = 0;
        this.tracks = [];
        this.zip = null;
        this.started = false;
    }
};

function displayAlert(url) {
    chrome.pageAction.show(objList[url].tabId);
    if (options.getNotification(SETTINGS_NOTIF_DOWNLOAD_ALERT)) {
        chrome.notifications.create(DOWNLOAD_NOTIFICATION + url, {
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': objList[url].content.albumart,
            "message": "Click here to download " + objList[url].artist + ' - ' + objList[url].album
        });
    }
}

function alertDownload(res) {
    if (res && res.struct && res.struct.trackinfo) {
        objList[res.url] = new Component;
        objList[res.url].tabId = res.tabId;
        objList[res.url].url = res.struct.url;
        objList[res.url].content = res.struct;
        objList[res.url].artist = res.struct.artist;
        objList[res.url].album = res.struct.current.title;
        objList[res.url].content.trackinfo.forEach(function (track, trackId) {
            let trackName = track.track_num + ' - ' + track.title + '.mp3';
            let trackUrl = '';
            for (var index in track.file) {
                trackUrl = track.file[index];
                break;
            }
            objList[res.url].tracks[trackId] = {
                retry: 0,
                file: trackName,
                track: track.title,
                success:null,
                url:trackUrl
            }
        })
        options.notify()
        displayAlert(res.url)
        chrome.pageAction.setTitle({
            "tabId":res.tabId,
            "title":"Download " + objList[res.url].artist + ' - ' + objList[res.url].album
        });
    }
}

function rejectDownload(url) {
    chrome.notifications.clear(DOWNLOAD_NOTIFICATION + url);
    chrome.notifications.clear(PROGRESS_NOTIFICATION + url);
    chrome.notifications.clear(COMPLETE_NOTIFICATION + url);
    chrome.pageAction.hide(objList[url].tabId);
    delete objList[url]
    options.notify()
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
    if (options.getNotification(SETTINGS_NOTIF_DOWNLOAD_PROGRESS)) {
        chrome.notifications.create(PROGRESS_NOTIFICATION + url, {
            'title': "Downloading " + objList[url].artist + ' - ' + objList[url].album,
            'type': "progress",
            'iconUrl': objList[url].content.albumart,
            "message": "Initializing...",
            "progress": 1,
            "isClickable": false,
            "requireInteraction": true
        });
    }
    objList[url].size = objList[url].content.trackinfo.length;
    objList[url].progress = 0;
    objList[url].started = true;
    objList[url].zip = new JSZip();
    objList[url].folder = objList[url].zip.folder(objList[url].artist).folder(objList[url].album);
    options.notify()
    for (let trackId in objList[url].content.trackinfo) {
        downloadProcess(url, trackId)
    }
}

function downloadProcess(url, trackId) {
    objList[url].tracks[trackId].success = null
    let trackUrl = objList[url].tracks[trackId].url
    let xhr = new XMLHttpRequest()
    xhr.open("GET", 'https:' + trackUrl + '&retry=' + objList[url].tracks[trackId].retry++)
    xhr.responseType = "blob"
    xhr.arguments = {"url":url, "trackId":trackId}
    xhr.onload = function() {
        let success = (objList[this.arguments.url].tracks[this.arguments.trackId].success = (this.status === 200))
        if (success) {
            objList[this.arguments.url].folder.file(objList[this.arguments.url].tracks[this.arguments.trackId].file, this.response)
            objList[this.arguments.url].progress++
        }
        if (options.getNotification(SETTINGS_NOTIF_DOWNLOAD_PROGRESS)) {
            chrome.notifications.update(PROGRESS_NOTIFICATION + this.arguments.url, {
                "progress": getProgress(this.arguments.url),
                "message": objList[this.arguments.url].tracks[this.arguments.trackId].track + (success ? " downloaded!" : " errored !")
            })
        }
        options.notify()
        if (getProgress(this.arguments.url) === 100) {
            downloadZip(this.arguments.url)
        }
    };
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200 && options.getNotification(SETTINGS_NOTIF_DOWNLOAD_ERROR)) {
            chrome.notifications.create({
                'title': objList[this.arguments.url].artist + ' - ' + objList[this.arguments.url].album + " error while downloading!",
                'type': "basic",
                'iconUrl': objList[this.arguments.url].content.albumart,
                "message": "Error while downloading " + objList[this.arguments.url].tracks[this.arguments.trackId].track + ' : ' + this.statusText
            })
        }
    }
    xhr.send(null)
}

function getProgress(url) {
    let progress = Math.round((objList[url].progress/(objList[url].size))*100);
    return progress < 0 ? 0 : (progress > 100 ? 100 : progress)
}

function downloadZip(url) {
    objList[url].zip.generateAsync({type:"blob"}).then(
        function(content) {
            chrome.notifications.clear(PROGRESS_NOTIFICATION+url);
            if (options.getNotification(SETTINGS_NOTIF_DOWNLOAD_COMPLETE)) {
                chrome.notifications.create(COMPLETE_NOTIFICATION + url, {
                    'title': objList[url].artist + ' - ' + objList[url].album,
                    'type': "basic",
                    'iconUrl': objList[url].content.albumart,
                    "message": "download complete!"
                });
            }
            saveAs(content, objList[url].artist + ' - ' + objList[url].album + ".zip");
            delete objList[url]
            options.notify()
        }
    );
}
