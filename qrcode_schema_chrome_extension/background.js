function getDomainFromUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    var o = a.origin;
    return o.replace(a.protocol+'//','');
};

function checkForValidUrl(tabId, changeInfo, tab) {
    if (getDomainFromUrl(tab.url).toLowerCase().indexOf('qunar') > -1) {
        chrome.pageAction.show(tabId);
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);
