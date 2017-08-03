const SETTINGS_NOTIF_DOWNLOAD_ALERT = 'SETTINGS_NOTIF_DOWNLOAD_ALERT',
    SETTINGS_NOTIF_DOWNLOAD_ALERT_DISCOGRAPHY = 'SETTINGS_NOTIF_DOWNLOAD_ALERT_DISCOGRAPHY',
    SETTINGS_NOTIF_DOWNLOAD_PROGRESS = 'SETTINGS_NOTIF_DOWNLOAD_PROGRESS',
    SETTINGS_NOTIF_DOWNLOAD_COMPLETE = 'SETTINGS_NOTIF_DOWNLOAD_COMPLETE',
    SETTINGS_NOTIF_DOWNLOAD_ERROR = 'SETTINGS_NOTIF_DOWNLOAD_ERROR',
    SETTINGS_OPTION_AUTO_START_DOWNLOAD = 'SETTINGS_OPTION_AUTO_START_DOWNLOAD';

class Options {
    constructor() {
        this.notifMapping = {
            SETTINGS_NOTIF_DOWNLOAD_ALERT: {
                name: 'bndcmpdwn.options.notif.download.alert',
                value: true,
                display: "Download Alert",
                title: "Notification when an album is downloadable",
            },
            SETTINGS_NOTIF_DOWNLOAD_ALERT_DISCOGRAPHY: {
                name: 'bndcmpdwn.options.notif.download.alert_disco',
                value: true,
                display: "Download discography Alert",
                title: "Notification when a discography is downloadable",
            },
            SETTINGS_NOTIF_DOWNLOAD_PROGRESS: {
                name: 'bndcmpdwn.options.notif.download.progress',
                value: true,
                display: "Download Progress",
                title: "Notification with a progress bar on tracks remaining to download to complete an album",
            },
            SETTINGS_NOTIF_DOWNLOAD_COMPLETE: {
                name: 'bndcmpdwn.options.notif.download.complete',
                value: false,
                display: "Download Complete",
                title: "Notification when an album finished downloading",
            },
            SETTINGS_NOTIF_DOWNLOAD_ERROR: {
                name: 'bndcmpdwn.options.notif.download.error',
                value: true,
                display: "Download Error",
                title: "Notification when a track is not downloadable for the moment - will NOT stop dowloading album but track will be missing !",
            }
        };
        this.optionsMapping = {
            SETTINGS_OPTION_AUTO_START_DOWNLOAD: {
                name: 'bndcmpdwn.options.option.download.autostart',
                value: false,
                display: "Download Autostart",
                title: "Automatically start to download when album is detected",
            }
        }
    }

    setNotification(name, value) {
        let mapping = this.notifMapping[name]
        localStorage.setItem(mapping.name, value)
        return this
    }

    setOption(name, value) {
        let mapping = this.optionsMapping[name]
        localStorage.setItem(mapping.name, value)
        return this
    }

    getNotification(name) {
        let mapping = this.notifMapping[name]
        let value = localStorage.getItem(mapping.name)
        value = (value === null ? mapping.value : value === 'true')
        return value
    }

    getOption(name) {
        let mapping = this.optionsMapping[name]
        let value = localStorage.getItem(mapping.name)
        value = (value === null ? mapping.value : value === 'true')
        return value
    }

    notify() {
        let name = 'bndcmpdwn.notify'
        localStorage.setItem(name, Math.random() * 100000)
    }
}
