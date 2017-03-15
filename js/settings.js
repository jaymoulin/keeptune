class Settings {
    constructor(options) {
        if (options instanceof Options) {
            this.options = options
        }
        this.createNotifications()
            .bindNotifications()
            .createDownloads()
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

    createDownloads() {
        let html = ''
        for (let url in chrome.extension.getBackgroundPage().objList) {
            let component = chrome.extension.getBackgroundPage().objList[url]
            let tracks = ''
            component.tracks.forEach(function (info, trackId) {
                let status = ''
                if (info.success === false) {
                    status = `<a class="label label-danger jsRetryTrack" data-url="${url}" data-trackid="${trackId}">Failed / Retry</a>`
                } else if (info.success === true) {
                    status = '<span class="label label-success">Success</span>'
                } else {
                    status = '<span class="label label-warning">Waiting</span>'
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
                : `<div class="col-xs-9 col-md-10">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="width: $(progress)%"><span class="sr-only">${progress}% Complete</span></div>
                    </div>
                </div>
                <div class="col-xs-3 col-md-2">
                    <button type="button" class="btn btn-md btn-warning" data-url="${url}">Download anyway</button>
                </div>
                <div class="clearfix"></div>`
            html += `<div class="panel panel-primary">
                        <div class="panel-heading">
                            <h2 class="panel-title">${component.artist} - ${component.album}</h2>
                        </div>
                        <div class="panel-body">
                            ${progressBar}
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
        document.getElementById('downloads_list').innerHTML = html
        return this
    }
}

window.addEventListener('load', function() {
    let options = new Options();
    let settings = new Settings(options);

    for (let index in options.notifMapping) {
        let mapping = options.notifMapping[index]
        if (options.getNotification(index)) {
            document.getElementById(mapping.name).checked = 'checked'
        }
    }
})