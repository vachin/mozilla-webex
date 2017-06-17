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
var HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PATCH: "PATCH"
};
var VACHIN_API_ROOT = "https://api.vach.in";
var DEFAULT_PAGE_COUNT = 10;

var ERROR_MESSAGES = {
    _404: "Nothing with us..!, why don't you add one ?",
    _505: "Something went wrong..!"
};

/**
 * Message API Builder
 * @param categoryId
 * @param messageId
 * @returns {string}
 */
function getMessageAPI(categoryId, messageId){
    return "categories/" + categoryId + "/messages/" + (messageId ? messageId : "");
}

/**
 * Search API Builder
 * @param query
 * @param categoryId
 * @returns {string}
 */
function getSearchAPI(query, categoryId){
    return "messages/search?q=" + query + categoryId ? "&categoryId=" + categoryId : "";
}

var APIS = {
    getCategories: {
        method: "GET",
        endPoint: "categories"
    },
    postCategories: {
        method: "POST",
        endPoint: "categories"
    },
    getMessages: {
        method: "GET",
        endPoint: function (categoryId) {
            return getMessageAPI(categoryId);
        }
    },
    postMessage: {
        method: "POST",
        endPoint: function (categoryId) {
            return getMessageAPI(categoryId);
        }
    },
    updateCount: {
        method: "PATCH",
        endPoint: function (categoryId, messageId) {
            return getMessageAPI(categoryId, messageId);
        }
    },
    search: {
        method: "GET",
        endPoint: function (query, categoryId) {
            return getSearchAPI(query, categoryId);
        }
    }
};

var vachinCache = {
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

var categoryChooser = document.getElementById("vachin-selector");
var categoryList = document.getElementById("vachin-categories");
var messageListElement = document.getElementById("vachin-messages");
var loadingElement = document.getElementById("vachin-loading");
var errorElement = document.getElementById("vachin-error");

var chosenCategory;

/**
 * Keep listening category chooser for category change
 */
categoryChooser.addEventListener("input", function(e) {
    showLoading();
    chosenCategory = e.target.value;
    if(vachinCache.hasOwnProperty(chosenCategory)){
        if(vachinCache[chosenCategory].length > 0){
            populateMessages(vachinCache[chosenCategory]);
        }else{
            getMessages(chosenCategory);
        }
    }else{
        searchMessages(chosenCategory); //it's query actually
    }
});

/**
 * shows error message
 * @param message
 */
function showError(message) {
    errorElement.innerHTML = message;
    errorElement.style.display = "block";
}

/**
 * hides error message
 */
function hideError() {
    errorElement.style.display = "none";
}

/**
 * shows loading icon
 */
function showLoading() {
    loadingElement.style.display = "block";
}

/**
 * hides loading icon
 */
function hideLoading() {
    loadingElement.style.display = "none";
}

/**
 *
 * @param query
 * @param categoryId
 */
function searchMessages(query, categoryId) {
    callAPI(APIS.search.endPoint(query, categoryId), APIS.search.method, null, function (messagesResponse) {
        var messages = JSON.parse(messagesResponse);
        populateMessages(messages);
    }, function (err) {
        showError(ERROR_MESSAGES._404);
    });
}

/**
 *
 * @param categoryId
 */
function getMessages(categoryId) {
    callAPI(APIS.getMessages.endPoint(categoryId), APIS.getMessages.method, null, function (messagesResponse) {
        var messages = JSON.parse(messagesResponse);
        populateMessages(messages);
    }, function (err) {
        showError(ERROR_MESSAGES._404);
    });
}

/**
 * Builds the initial cache from storage or from server
 */
function buildInitialCache() {
    if(cacheService.get){
        vachinCache = cacheService.get;
        for(var category in vachinCache){
            if(vachinCache.hasOwnProperty(category)){
                if(vachinCache[category].length > 0){
                    categoryChooser.value = category;
                    populateMessages(vachinCache[category], category);
                }
            }
        }
    }else {
        callAPI(APIS.getCategories.endPoint, APIS.getCategories.method, null, function (categoriesResponse) {
            try {
                var categories = JSON.parse(categoriesResponse);
                categories.forEach(function (category) { //building initial cache list
                    vachinCache[category._id] = [];
                });
                populateCategories(categories);
                callAPI(APIS.getMessages.endPoint(categories[0]._id), APIS.getMessages.method, null, function (messagesResponse) {
                    var messages = JSON.parse(messagesResponse);
                    vachinCache[categories[0]._id] = messages;
                    cacheService.set(vachinCache);
                    populateMessages(messages, categories[0]._id);
                });
            } catch (e) {
                showError(ERROR_MESSAGES._505);
            }
        }, function (err) {
            showError(ERROR_MESSAGES._505);
        });
    }
}

/**
 *
 * @param categories
 */
function populateCategories(categories) {
    while (categoryList.firstChild) { //removing existing categories
        categoryList.removeChild(categoryList.firstChild);
    }
    categories.forEach(function (category) {
        var option = document.createElement("option");
        option.setAttribute("value", category.name);
        option.setAttribute("data-value", category._id);
        categoryList.appendChild(option);
    });
}

/**
 *
 * @param categoryId
 * @param messageId
 * @returns {Element}
 */
function getCopyIcon(categoryId, messageId) {
    var copyEl = document.createElement("img");
    copyEl.setAttribute("src", "../icons/copy.png");
    copyEl.setIdAttribute(messageId, true);
    copyEl.addEventListener('click', function (e) {
        callAPI(APIS.updateCount.endPoint(categoryId, messageId), APIS.updateCount.method, {}, function (res) {
            if(JSON.parse(res)){
                //TODO: update count either real time or later need to decide
                document.getElementById("count-" + messageId).innerText  += 1; //FIXME: check this
            }
        });
    });
    return copyEl;
}

/**
 * Populates the new category messages
 * @param messages
 * @param categoryId
 */
function populateMessages(messages, categoryId) {
    while (messageListElement.firstChild) { //removing existing messages
        messageListElement.removeChild(messageListElement.firstChild);
    }
    messages.forEach(function (message) {
        var tr = document.createElement("tr");
        var messageTd = document.createElement("td");
        var countTd = document.createElement("td");
        var copyTd = document.createElement("td");
        messageTd.innerText = message.text;
        messageTd.classList.add("vachin-message");
        countTd.innerText = message.count;
        countTd.setIdAttribute("count-" + message._id, true);
        copyTd.appendChild(getCopyIcon(message._id));
        tr.appendChild(messageTd);
        tr.appendChild(countTd);
        tr.appendChild(copyTd);
        messageListElement.appendChild(tr);
    });
}

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
    xmlHTTP.send();
}

/**
 *
 * @type {{set: cacheService.set, get: cacheService.get}}
 */
var cacheService = {
    set: function(cache) {
        storage.StorageArea.set("vachinCache", JSON.stringify(cache));
    },
    get: function(){
        return JSON.parse(storage.StorageArea.set("vachinCache"));
    }
};