/**
 * Created by jyothi on 20/6/17.
 */
/**
 * CONSTANTS to go with
 * @type {string}
 */
var DOMAINS_ALLOWED = [ //TODO: take from API
    "https://www.linkedin.com/messaging/thread",
    "https://www.facebook.com",
    "https://www.messenger.com",
    "https://web.skype.com",
    "https://web.whatsapp.com",
    "https://gitter.im",
    "https://web.telegram.org",
    "https://mail.google.com"
];

browser.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
    for(var i = 0; i < DOMAINS_ALLOWED.length; i++){
        if(tab.url.indexOf(DOMAINS_ALLOWED[i]) != -1){
            browser.pageAction.show(tab.id);
            break;
        }
    }
});

/**
 *
 * @param endPoint
 * @param method
 * @param body
 * @param successCallback
 * @param errorCallback
 */
function callAPI(endPoint, method, body, successCallback, errorCallback) {
    showLoading();
    hideError();
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            hideLoading();
            successCallback(xmlHTTP.responseText);
        }
    };
    xmlHTTP.open(method, VACHIN_API_ROOT + endPoint, true);
    xmlHTTP.setRequestHeader('Accept', 'application/json');
    xmlHTTP.setRequestHeader('Content-type', 'application/json');
    xmlHTTP.send();
}