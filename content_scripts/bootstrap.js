/**
 * Created by jyothi on 17/6/17.
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
