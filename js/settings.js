class Settings {
    constructor(options) {
        if (options instanceof Options) {
            this.options = options
        }
        this
            .renderPage()
            .bindMenu()
            .createNotifications()
            .bindNotifications()
            .toggleNotifications()
            .createDownloads()
            .bindDownloads()
    }

    renderPage() {
        if (window.location.hash == '#settings') {
            document.getElementById('settings').style.display = 'block'
            document.getElementById('downloads').style.display = 'none'
            document.getElementById('menu_settings').className = 'active'
            document.getElementById('menu_downloads').className = ''
        } else {
            document.getElementById('settings').style.display = 'none'
            document.getElementById('downloads').style.display = 'block'
            document.getElementById('menu_settings').className = ''
            document.getElementById('menu_downloads').className = 'active'
        }
        return this
    }

    bindMenu() {
        window.onpopstate = this.renderPage
        return this
    }

    createNotifications() {
        let html = ''
        for (let index in this.options.notifMapping) {
            let mapping = this.options.notifMapping[index]
            html += `<li class="list-group-item">
                    ${mapping.display}
                    <div class="material-switch pull-right">
                        <input id="${mapping.name}" type="checkbox" title="${mapping.title}"/>
                        <label for="${mapping.name}" class="label-primary" title="${mapping.title}"></label>
                    </div>
                </li>`
        }

        document.getElementById('notifications_list').innerHTML = html
        return this
    }


    bindNotifications() {
        for (let index in this.options.notifMapping) {
            let mapping = this.options.notifMapping[index]
            document.getElementById(mapping.name).addEventListener('change', evt => this.options.setNotification(index, evt.target.checked))
        }
        return this
    }

    toggleNotifications() {
        for (let index in this.options.notifMapping) {
            let mapping = this.options.notifMapping[index]
            if (this.options.getNotification(index)) {
                document.getElementById(mapping.name).checked = 'checked'
            }
        }
        return this;
    }

    createDownloads() {
        let html = ''
        let hasOneError = false
        let hasOneWaiting = false
        let hasOneNotStarted = false
        for (let url in chrome.extension.getBackgroundPage().objList) {
            let component = chrome.extension.getBackgroundPage().objList[url]
            hasOneNotStarted = hasOneNotStarted || !component.started
            let tracks = ''
            let tracksHasError = false
            let tracksHasWaiting = false
            component.tracks.forEach(function (info, trackId) {
                let status = ''
                if (info.success === false) {
                    status = `<a class="label label-danger jsRetryTrack" data-url="${url}" data-trackid="${trackId}">Failed / Retry</a>`
                    tracksHasError = true
                    hasOneError = true
                } else if (info.success === true) {
                    status = '<span class="label label-success">Success</span>'
                } else {
                    status = '<span class="label label-warning">Waiting</span>'
                    tracksHasWaiting = true
                    hasOneWaiting = true
                }
                tracks += `<li class="col-xs-12">
                                <div class="col-xs-10">${info.track}</div>
                                <div class="col-xs-2">
                                    ${status}
                                </div>
                            </li>`
            })
            let progress = chrome.extension.getBackgroundPage().getProgress(component.url)
            let progressBar = progress === 100
                ? ''
                : `<div class="${tracksHasError && !tracksHasWaiting ? 'col-xs-8 col-md-9' : 'col-xs-12'}">
                    <div class="progress">
                        <div class="progress-bar ${tracksHasError ? (tracksHasWaiting ? 'progress-bar-warning' : 'progress-bar-danger') : 'progress-bar-striped'}" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="width: ${progress}%"><span class="sr-only">${progress}% Complete</span></div>
                    </div>
                </div>` +
                (tracksHasError && !tracksHasWaiting ? `
                <div class="col-xs-4 col-md-3">
                    <div class="btn-group btn-group-justified" role="group" aria-label="Downloadalbum">
                      <div class="btn-group" role="group">
                        <button type="button" class="btn btn-md btn-warning jsDownloadAnyway" data-url="${url}">Download anyway</button>
                      </div>
                      <div class="btn-group" role="group">
                        <button type="button" class="btn btn-md btn-info jsRetryAll" data-url="${url}">Retry all</button>
                      </div>
                    </div>
                </div>` : '')
                + '<div class="clearfix"></div>'
            let launcher = `<div class="btn-group btn-group-justified" role="group" aria-label="Start download">
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-success jsCTAAccept" data-url="${url}">Download</button>
                  </div>
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-danger jsCTAReject" data-url="${url}">Reject</button>
                  </div>
                </div>`
            let clickToAction = component.started ? progressBar : launcher
            html += `<div class="panel panel-primary">
                        <div class="panel-heading">
                            <h2 class="panel-title">${component.artist} - ${component.album}</h2>
                        </div>
                        <div class="panel-body">
                            ${clickToAction}
                            <div class="col-sm-3">
                                <img src="${component.content.albumart}" class="img-responsive img-rounded"/>
                            </div>
                            <div class="col-sm-9">
                                <ol>
                                    ${tracks}
                                </ol>
                            </div>
                        </div>
                    </div>`
        }
        if (html != '') {
            document.getElementById('downloads_list').innerHTML = html
        }

        let pageHeader = `Downloads `

        if (hasOneNotStarted) {
            pageHeader += `<button type="button" class="btn btn-success jsAcceptAll">Download all</button>
                        <button type="button" class="btn btn-danger jsRejectAll">Reject all</button>`

        }
        if (hasOneError && !hasOneWaiting) {
            pageHeader += '<button type="button" class="btn btn-info jsRetryAllAlbums">Retry all</button>'
        }
        document.querySelector("#downloads .page-header h1").innerHTML = pageHeader
        return this
    }

    bindDownloads() {
        document.getElementById("downloads").addEventListener("click", function(e) {
            if (e.target && e.target.matches(".jsCTAReject")) {
                chrome.extension.getBackgroundPage().rejectDownload(e.target.attributes['data-url'].value)
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsCTAAccept")) {
                chrome.extension.getBackgroundPage().startDownloadAlbum({url: e.target.attributes['data-url'].value})
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsDownloadAnyway")) {
                chrome.extension.getBackgroundPage().downloadZip(e.target.attributes['data-url'].value)
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsRetryTrack")) {
                chrome.extension.getBackgroundPage().downloadProcess(e.target.attributes['data-url'].value, e.target.attributes['data-trackid'].value)
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsRetryAll")) {
                e.target.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.jsRetryTrack').forEach(function (elm) {
                    chrome.extension.getBackgroundPage().downloadProcess(elm.attributes['data-url'].value, elm.attributes['data-trackid'].value)
                })
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsRetryAllAlbums")) {
                document.getElementById('downloads_list').querySelectorAll('.jsRetryTrack').forEach(function (elm) {
                   chrome.extension.getBackgroundPage().downloadProcess(elm.attributes['data-url'].value, elm.attributes['data-trackid'].value)
                })
               window.location.reload()
            }
            if (e.target && e.target.matches(".jsAcceptAll")) {
                document.getElementById('downloads_list').querySelectorAll('.jsCTAAccept').forEach(function (elm) {
                    chrome.extension.getBackgroundPage().startDownloadAlbum({url: elm.attributes['data-url'].value})
                })
                window.location.reload()
            }
            if (e.target && e.target.matches(".jsRejectAll")) {
                document.getElementById('downloads_list').querySelectorAll('.jsCTAReject').forEach(function (elm) {
                    chrome.extension.getBackgroundPage().rejectDownload(elm.attributes['data-url'].value)
                })
                window.location.reload()
            }
        });
        window.addEventListener('storage', () => window.location.reload())
        return this
    }
}

window.addEventListener('load', () => new Settings(new Options()))