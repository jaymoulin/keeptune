if (chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        var struct = hackJSvars();
        if (struct) {
            sendResponse({"url": struct.id, "tabId": message.tabId, "struct": struct});
        }
    });
}

function hackJSvars() {
    var pagedata = document.getElementById("pagedata");
    if (typeof(pagedata) == 'undefined' || pagedata == null) {
        return null;
    }

    var script = document.createElement('script');
    var scriptContent = "document.getElementById(\"pagedata\").title = JSON.stringify(TralbumData);";
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);


    var el = (JSON.parse(pagedata.title));
    el.albumart = document.getElementById("tralbumArt").getElementsByTagName('img')[0].src;
    return el;
}
