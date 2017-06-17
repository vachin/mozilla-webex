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
    "https://web.whatsapp.com"
];
var CSS = '';

var data = {
    daily: [
        "Good Morning..!",
        "Good Evening..!"
    ],
    friendship: [
        "East or West Friendship is best.",
        "You are my BFF.",
        "Jaldhi avoree..!",
        "What about Second show..?"
    ],
    love: [
        "I Love You.",
        "I just joked..!",
        "Really...?",
        "Any doubt baby..?",
        "No issues..!",
        "I hate you..!",
        "Just break up..!",
        "How are days going ?",
        "Boring without you :(",
        "Get the hell out of here..!"
    ]
};

var chosenCategory = data.daily;

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("vachin-selector")) {

        var chosenCategory = e.target.value;

        var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});

    }
    else if (e.target.classList.contains("copy")) {
        browser.tabs.reload();
        window.close();

        return;
    }
});
