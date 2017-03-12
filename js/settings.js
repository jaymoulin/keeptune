class Settings {
    constructor(options) {
        if (options instanceof Options) {
            this.options = options
        }
        this.createNotifications()
            .bindNotifications()
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