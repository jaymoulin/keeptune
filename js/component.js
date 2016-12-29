const DOWNLOAD_NOTIFICATION = 'DOWNLOAD_NOTIFICATION';
const PROGRESS_NOTIFICATION = 'PROGRESS_NOTIFICATION';

var objList = [];
class Component {
    constructor() {
        this.content = null;
        this.artist = null;
        this.album = null;
        this.folder = null;
        this.size = 0;
        this.progress = 0;
        this.zip = null;
    }
};

function alertDownload (res) {
    if (res && res.struct && res.struct.trackinfo) {
        objList[res.tabId] = new Component;
        objList[res.tabId].content = res.struct;
        objList[res.tabId].artist = res.struct.artist;
        objList[res.tabId].album = res.struct.current.title;
        chrome.pageAction.setTitle({
            "tabId":res.tabId,
            "title":"Download " + objList[res.tabId].artist + ' - ' + objList[res.tabId].album
        });
        chrome.pageAction.onClicked.addListener(startDownloadAlbum);
        chrome.notifications.create(DOWNLOAD_NOTIFICATION + res.tabId, {
            'title': "This album is downloadable!",
            'type': "basic",
            'iconUrl': res.struct.albumart,
            "message": "Click here to download " + objList[res.tabId].artist + ' - ' + objList[res.tabId].album
        });
        chrome.notifications.onClicked.addListener(startDownloadAlbum);
    }
}

function startDownloadAlbum(notifId) {
    if (typeof (notifId) !== 'object' && notifId && notifId.indexOf(DOWNLOAD_NOTIFICATION) !== 0) {
        return;
    }
    var tabId = typeof (notifId) == 'object' ? notifId.id : notifId.replace(DOWNLOAD_NOTIFICATION, '')-0;
    chrome.notifications.clear(DOWNLOAD_NOTIFICATION + tabId);
    chrome.pageAction.hide(tabId);
    chrome.notifications.create(PROGRESS_NOTIFICATION + tabId, {
        'title': "Downloading " + objList[tabId].artist + ' - ' + objList[tabId].album,
        'type': "progress",
        'iconUrl': objList[tabId].content.albumart,
        "message": "Initializing...",
        "progress": 1,
        "isClickable": false,
        "requireInteraction": true
    });
    objList[tabId].size = objList[tabId].content.trackinfo.length;
    objList[tabId].progress = 0;
    objList[tabId].zip = new JSZip();
    objList[tabId].folder = objList[tabId].zip.folder(objList[tabId].artist).folder(objList[tabId].album);
    for(var i in objList[tabId].content.trackinfo) {
        var track = objList[tabId].content.trackinfo[i];
        var trackName = track.track_num + ' - ' + track.title + '.mp3';
        var url = '';
        for (var index in track.file) {
            url = track.file[index];
            break;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https:' + url);
        xhr.responseType = "blob";
        xhr.arguments = {"trackName": trackName, "tabId":tabId};
        xhr.onload = function() {
            objList[this.arguments.tabId].folder.file(this.arguments.trackName, this.response);
            var progress = Math.round((++(objList[this.arguments.tabId].progress)/(objList[this.arguments.tabId].size))*100);
            chrome.notifications.update(PROGRESS_NOTIFICATION + this.arguments.tabId, {
                "progress": progress < 0 ? 0 : (progress > 100 ? 100 : progress),
                "message": this.arguments.trackName + " downloaded!"
            });
            if (objList[this.arguments.tabId].progress == objList[this.arguments.tabId].size) {
                downloadZip(this.arguments.tabId);
            }
        };
        xhr.send(null);
    }
}

function downloadZip(tabId) {
    chrome.pageAction.show(tabId);
    objList[tabId].zip.generateAsync({type:"blob"}).then(
        function(content) {
            chrome.notifications.clear(PROGRESS_NOTIFICATION+tabId);
            saveAs(content, objList[tabId].artist + ' - ' + objList[tabId].album + ".zip");
        }
    );
}