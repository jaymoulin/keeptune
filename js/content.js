if (chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        let discolumns = hackDisco();
        if (discolumns) {
            sendResponse({"type": 'disco', "tabId": message.tabId, "url": window.location.hostname, "struct": discolumns});
            return;
        }
        let struct = hackJSvars();
        if (struct) {
            sendResponse({"url": struct.id, "tabId": message.tabId, "struct": struct, "type":'album'});
            return;
        }
    });
}

function hackJSvars() {
    let pagedata = document.getElementById("pagedata");
    if (typeof(pagedata) === 'undefined' || pagedata === null) {
        return null;
    }

    let script = document.createElement('script');
    let scriptContent = "document.getElementById(\"pagedata\").title = JSON.stringify(TralbumData);";
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    let el = (JSON.parse(pagedata.title));
    el.albumart = document.getElementById("tralbumArt").getElementsByTagName('img')[0].src;
    return el;
}

function hackDisco() {
    let discolumns = document.getElementsByClassName('leftMiddleColumns');
    if (typeof(discolumns) === 'undefined' || discolumns === null) {
        return null;
    }
    if (discolumns.length) {
        let discol = discolumns[0].getElementsByTagName('ol');
        if (discol.length) {
            return {
                albums:eval(discol[0].getAttribute('data-initial-values')),
                albumart:document.getElementsByClassName("popupImage")[0].getAttribute('href')
            };
        }
    }
    return null;
}
