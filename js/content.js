if (chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => sendResponse({"tabId": message.tabId, "struct": hackJSvars()}));
}

function hackJSvars() {
    var script = document.createElement('script');
    var scriptContent = "document.getElementById(\"pagedata\").title = JSON.stringify(TralbumData);";
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    var el = (JSON.parse(document.getElementById("pagedata").title));
    el.albumart = document.getElementById("tralbumArt").getElementsByTagName('img')[0].src;
    return el;
}