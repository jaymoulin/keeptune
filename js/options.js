const DB_OPTION_DOWNLOAD_MODE = 'bndcmpdwn.options.download_mode'
const OPTION_DOWNLOAD_MODE_ASYNC = 'async'
const OPTION_DOWNLOAD_MODE_SYNC = 'sync'

class Options {
    constructor() {
        this.download_mode = localStorage.getItem(DB_OPTION_DOWNLOAD_MODE) == OPTION_DOWNLOAD_MODE_ASYNC ? OPTION_DOWNLOAD_MODE_ASYNC : OPTION_DOWNLOAD_MODE_SYNC
    }
}
