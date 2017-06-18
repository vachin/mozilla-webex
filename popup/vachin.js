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
var HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PATCH: "PATCH"
};
var VACHIN_API_ROOT = "http://api.vach.in/";
var DEFAULT_PAGE_COUNT = 20;

var ERROR_MESSAGES = {
    _404: "Nothing with us..!, why don't you add one ?",
    _505: "Something went wrong..!"
};

/**
 * Message API Builder
 * @param categoryId
 * @param queryParams
 * @returns {string}
 */
function getMessageAPI(categoryId, queryParams){
    return "categories/" + categoryId + "/messages?count=" + queryParams.count + "&page=" + queryParams.page;
}

/**
 *
 * @param categoryId
 * @param messageId
 * @returns {string}
 */
function getUpdateMessageCountAPI(categoryId, messageId){
    return "categories/" + categoryId + "/messages/count?messageId=" + messageId;
}

/**
 * Search API Builder
 * @param query
 * @param categoryId
 * @returns {string}
 */
function getSearchAPI(query, categoryId){
    return "messages/search?q=" + query + (categoryId ? "&categoryId=" + categoryId : "");
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
        endPoint: function (categoryId, queryParms) {
            return getMessageAPI(categoryId, queryParms);
        }
    },
    postMessage: {
        method: "POST",
        endPoint: function (categoryId) {
            return getMessageAPI(categoryId);
        }
    },
    updateCount: {
        method: "GET",
        endPoint: function (categoryId, messageId) {
            return getUpdateMessageCountAPI(categoryId, messageId);
        }
    },
    search: {
        method: "GET",
        endPoint: function (query, categoryId) {
            return getSearchAPI(query, categoryId);
        }
    }
};

var vachinCache = {}; //Application Buffer

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
    //chosenCategory = e.target.dataset.value;
    //var chosenCategoryId = e.target.dataset.value;
    /*if(vachinCache.hasOwnProperty(chosenCategory)){ //FIXME: only search as of now
        if(vachinCache[chosenCategory].length > 0){
            populateMessages(vachinCache[chosenCategory]);
        }else{
            getMessages(chosenCategory);
        }
    }else{*/
        if(chosenCategory.trim() !== ""){
            searchMessages(chosenCategory.trim()); //it's query actually
        }else{
            hideLoading();
            hideError();
        }
    //}
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
    callAPI(APIS.getMessages.endPoint(categoryId, {page: 1, count: DEFAULT_PAGE_COUNT}), APIS.getMessages.method, null, function (messagesResponse) {
        var messages = JSON.parse(messagesResponse);
        populateMessages(messages);
    }, function (err) {
        showError(ERROR_MESSAGES._404);
    });
}

/**
 * Builds the initial cache from storage or from server
 */
function bootstrapVachin() {
    /*cacheService.get("vachinCache").then(function (cache) { //FIXME: storage not working
        vachinCache = cache.vachinCache;
        for(var category in vachinCache){
            if(vachinCache.hasOwnProperty(category)){
                if(vachinCache[category].length > 0){
                    categoryChooser.value = category;
                    populateMessages(vachinCache[category], category);
                }
            }
        }
    }, function (err) {*/
        callAPI(APIS.getCategories.endPoint, APIS.getCategories.method, null, function (categoriesResponse) {
            try {
                var categories = JSON.parse(categoriesResponse);
                categories.forEach(function (category, index) { //building initial cache list
                    if(index === 0){
                        callAPI(APIS.getMessages.endPoint(category._id, {page: 1, count: DEFAULT_PAGE_COUNT}), APIS.getMessages.method, null, function (messagesResponse) {
                            var messages = JSON.parse(messagesResponse);
                            vachinCache[categories._id] = messages;
                            //cacheService.set(vachinCache);
                            populateMessages(messages, categories._id);
                        });
                    }
                    vachinCache[category._id] = [];
                });
                //populateCategories(categories);
            } catch (e) {
                showError(ERROR_MESSAGES._505);
            }
        }, function (err) {
            showError(ERROR_MESSAGES._505);
        });
    //});
}

/**
 *
 * @param categories
 */
function populateCategories(categories) {
    while (categoryList.firstChild) { //removing existing categories
        categoryList.removeChild(categoryList.firstChild);
    }
    categories.forEach(function (category, index) {
        var option = document.createElement("option");
        option.setAttribute("value", category.name);
        option.setAttribute("data-value", category._id);
        if(index === 1){
            option.defaultSelected = true;
        }
        categoryList.appendChild(option);
    });
    console.log(categoryList);
}

/**
 *
 * @param categoryId
 * @param messageId
 * @param message
 * @returns {Element}
 */
function getCopyIcon(categoryId, messageId, message) {
    var copyEl = document.createElement("img");
    copyEl.setAttribute("src", "../icons/copy.png");
    copyEl.setAttribute("id", messageId);
    copyEl.setAttribute("width", "16px");
    copyEl.setAttribute("height", "16px");
    copyEl.classList.add("vachin-copy-icon");
    copyEl.addEventListener('click', function (e) {
        copyToClipboard(message); //copies message to clipboard
        callAPI(APIS.updateCount.endPoint(categoryId, messageId), APIS.updateCount.method, {}, function (res) {
            if(JSON.parse(res)){
                //TODO: update count either real time or later need to decide
                var counter = document.getElementById("count-" + messageId);
                counter.innerText  = Number.parseInt(counter.innerText) + 1; //FIXME: check this
            }
        });
    });
    return copyEl;
}

/**
 * copies text to clipboard
 * @param text
 */
function copyToClipboard(text) {
    var tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    tempInput.remove();
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
        countTd.innerText = message.count || 0;
        countTd.setAttribute("id", "count-" + message._id);
        countTd.classList.add("vachin-count");
        copyTd.appendChild(getCopyIcon(message.category_id, message._id, message.text));
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
    xmlHTTP.setRequestHeader('Accept', 'application/json');
    xmlHTTP.setRequestHeader('Content-type', 'application/json');
    xmlHTTP.send();
}

/**
 *
 * @type {{set: cacheService.set, get: cacheService.get}}
 */
/*var cacheService = {
    set: function(cache) {
        browser.storage.local.set(cache);
    },
    get: function(key){
        return browser.storage.local.get(key);
    }
};*/

bootstrapVachin();