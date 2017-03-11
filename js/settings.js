window.addEventListener('load', function() {
    let options = new Options();
    let downloadMode = document.getElementById('download_mode')
    let modes = downloadMode.getElementsByTagName('option')
    for(idx in modes) {
        let element = modes[idx]
        if (element.value == options.download_mode) {
            element.setAttribute('selected', 'selected')
        }
    }

    downloadMode.addEventListener('change', function (evt) {
        localStorage.setItem(DB_OPTION_DOWNLOAD_MODE, evt.target.value)
    })

})