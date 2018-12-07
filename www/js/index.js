/* jshint browser: true */
/* jshint jquery: true */
/* globals google: true, appSettings: true, xhrURL: true, timeNowMySQL: true, firstTwoLettersOfName: true, hashToColor: true */

"use strict";

// debug
const test = false;                     // set to true for testing, false for production
const loadTime = 700;                   // load time when test is set to false
const testLoadTime = 300;               // load time when test is set to true
const splashTransition = 500;           // time for the splash screen transition to login
const testDiv = 'account-settings';     // if test is set to true, this div will immediately open

// app
let polling = false;

// immeditately invoked function expression
{
    // wait until all phonegap/cordova is loaded then fire start up events
    window.addEventListener("load", onDeviceReady);
    document.addEventListener("deviceready", onDeviceReady, false);

    // start with the login section
    showSection("app-login");

    // begin with app load/initialization
    initializeApp();

    // hide splash after 3s
    if (loadTime) hideSplash(loadTime, initializeLogin);

    if (test) {
        document.getElementById("login-button").click();
        document.getElementById(`${testDiv}-side-nav-button`).click();
    }
}

function initializeApp() {
    console.log("local storage session: " + window.localStorage.getItem("sessionToken"));
    let session = window.localStorage.getItem("sessionToken");

    if (session) {
        validateSession(session);
    }
}

function validateSession(token) {
    let procedure = "Session_Get";
    let data = {
        "token": token,
    };
    console.log("validating: " + token);

    const xhr = new XMLHttpRequest();
    let url = xhrURL(procedure, data);
    console.log("xhrURL: " + url);

    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log("200");
            let json = JSON.parse(xhr.responseText);
            if (json[0][0] !== undefined) {
                let session = json[0][0].Token;
                let active = json[0][0].Active.data[0];
                console.log(`session token ${session} retrieved; active: ${active}`);
                if (active == 1) {
                    initializeHomePage();
                } else {
                    console.log("session inactive");
                }
            } else {
                console.log("session not found in db");
            }
        } else if (this.readyState === 4 && this.status === 404) {
            console.log("unknown error occurred during session validation");
        }
    };
}

function authenticate() {
    let username = document.getElementById('login-username-input').value;
    let password = document.getElementById('login-password-input').value;
    let procedure = "SystemUser_Authenticate";
    let data = {
        "username": username,
        "password": password
    };

    const xhr = new XMLHttpRequest();
    let url = xhrURL(procedure, data);

    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log("200");
            let json = JSON.parse(xhr.responseText);
            if (json[0][0] !== undefined) {
                if (password == (json[0][0].Password)) {
                    window.alert(`Welcome ${username}!`);
                    createSession(json[0][0].SystemUserID);
                    initializeHomePage();
                } else {
                    window.alert("Incorrect credentials");
                }
            } else {
                window.alert("Incorrect credentials");
            }
        } else if (this.readyState === 4 && this.status === 404) {
            console.log("404");
            window.alert("Incorrect credentials");
        }
    };
}

function createSession(userID) {
    let date = timeNowMySQL();
    let procedure = "Session_Create";
    let data = {
        "startTime": date,
        "systemUserID": userID
    };

    const xhr = new XMLHttpRequest();
    let url = xhrURL(procedure, data);

    xhr.open('POST', url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log("200");
            let json = JSON.parse(xhr.responseText);
            if (json[0][0] !== undefined) {
                console.log(`session ${json[0][0].SessionID} created with token ${json[0][0].Token}`);
                setLocalStorage("sessionToken", json[0][0].Token);
                initializeHomePage();
            } else {
                window.alert("Unknown Error");
            }
        } else if (this.readyState === 4 && this.status === 404) {
            console.log("404");
            window.alert("Unknown Error");
        }
    };
}

function logout() {
    if (!window.confirm("Log out?")) return;

    deactivateSession()
        .then(() => {
            removeFromLocalStorage("sessionToken");
            location.reload(true);
        })
        .catch((err) => {
            console.log("unknown error with logout; " + err);
        });
}

function deactivateSession() {
    return new Promise(function (resolve, reject) {
        let token = window.localStorage.getItem("sessionToken");
        let date = timeNowMySQL();
        let procedure = "Session_Deactivate";
        let data = {
            "endTime": date,
            "token": token
        };

        const xhr = new XMLHttpRequest();
        let url = xhrURL(procedure, data);

        xhr.open('POST', url, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log("200");
                let json = JSON.parse(xhr.responseText);
                if (json[0][0] !== undefined) {
                    resolve(() => {
                        console.log(`session token ${json[0][0].Token} deactivated`);
                        window.alert(`session token ${json[0][0].Token} deactivated`);
                    });
                } else {
                    reject({
                        status: 404,
                        statusText: "unknown error"
                    });
                }
            } else if (this.readyState === 4 && this.status === 404) {
                reject({
                    status: 404,
                    statusText: "unknown error"
                });
            }
        };
    });
}

function setLocalStorage(key, value) {
    while (localStorage.getItem(key) !== null) {
        console.log(`removing key: ${localStorage.getItem(key)}`);
        localStorage.removeItem(key);
    }

    localStorage.setItem(key, value);
}

function removeFromLocalStorage(key) {
    while (localStorage.getItem(key) !== null) {
        console.log(`removing key: ${localStorage.getItem(key)}`);
        localStorage.removeItem(key);
    }
}

function initializeHomePage() {
    showSection("app-main");
    document.getElementById('nav-header').click();

    // one time read from db
    initializeUserSettings()
        .then((res) => {
            // keep polling db
            pollUserUpdates();
            polling = true;
        })
        .catch((err) => {
            console.log(`error with home page initialization, ${err}`);
        });
}

function initializeUserSettings() {
    return new Promise(function (resolve, reject) {
        console.log('p1-2');
        getUser()
            .then((res) => {
                console.log('p1-2');
                return getUserInfo(res);
            })
            .then((res) => {
                console.log('p1-3');
                applyUserSettings(res);
            })
            .then((res) => {
                console.log('p1-3');
                resolve(console.log("user settings initialization complete"));
            })
            .catch((err) => {
                reject({
                    status: 404,
                    statusText: `error with user settings initialization, ${err}`
                });
            });
        });
}

function getUser() {
    return new Promise(function (resolve, reject) {
        let token = window.localStorage.getItem("sessionToken");
        let procedure = "Session_Get";
        let data = {
            "token": token,
        };

        const xhr = new XMLHttpRequest();
        let url = xhrURL(procedure, data);

        xhr.open('GET', url, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log("200");
                let json = JSON.parse(xhr.responseText);
                if (json[0][0] !== undefined) {
                    console.log(`found user: ${json[0][0].SystemUserID}`);
                    resolve(json[0][0].SystemUserID);
                } else {
                    reject({
                        status: 404,
                        statusText: "session not found in db"
                    });
                }
            } else if (this.readyState === 4 && this.status === 404) {
                reject({
                    status: 404,
                    statusText: "unknown error occurred during session lookup"
                });
            }
        };
    });
}

function getUserInfo(systemUserID) {
    return new Promise(function (resolve, reject) {
        let procedure = "SystemUser_Get";
        let data = {
            "systemUserID": systemUserID,
        };

        const xhr = new XMLHttpRequest();
        let url = xhrURL(procedure, data);

        xhr.open('GET', url, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log("200");
                let json = JSON.parse(xhr.responseText);
                if (json[0][0] !== undefined) {
                    console.log(json[0][0]);
                    resolve(json[0][0]);
                } else {
                    reject({
                        status: 404,
                        statusText: "user not found in db"
                    });
                }
            } else if (this.readyState === 4 && this.status === 404) {
                reject({
                    status: 404,
                    statusText: "unknown error occurred during user lookup"
                });
            }
        };
    });
}

function applyUserSettings(user) {
    console.log('applying user settings');

    let color = hashToColor(user.SystemUserID);
    let nameAbbrv = firstTwoLettersOfName(user.Name);
    console.log("color: " + color);
    console.log("first two letters: " + nameAbbrv);

    document.getElementById("account-settings-user-icon").style.backgroundColor = color;
    document.getElementById("account-settings-user-icon-text").innerHTML = nameAbbrv;
    document.getElementById("account-settings-name-input").value = user.Name;
    document.getElementById("account-settings-username-input").value = user.Username;
    document.getElementById("account-settings-email-input").value = user.Email;
    document.getElementById("account-settings-password-input").value = user.Password;
    document.getElementById("manage-group-user-icon-0").style.backgroundColor = color;
    document.getElementById("manage-group-user-icon-text-0").innerHTML = nameAbbrv;
    document.getElementById("manage-group-user-name-0").innerHTML = user.Name;
    document.getElementById("manage-group-user-email-0").innerHTML = user.Email;
}

function beginUserUpdatePoll() {
    polling = true;
}

function pollUserUpdates() {
    console.log('p2-1');
    let user;

    getUser()
        .then((res) => {
            console.log('p2-2');
            return getUserInfo(res);
        })
        .then((res) => {
            console.log('p2-3');
            user = res;
            if (res.CurrentGroupID > 0) { // need to look for members
                return getGroupMembers(res.CurrentGroupID);
            }
        })
        .then((res) => {
            if (res.length > 0) { // need to look for members
                addGroupMembers(res, user);
            }
        })
        .catch((err) => {
            console.log("error with user polling; " + err);
        });
}

function getGroupMembers(groupID) {
    return new Promise(function (resolve, reject) {
        let procedure = "SystemUser_GetGroup";
        let data = {
            "currentGroupID": groupID,
        };

        const xhr = new XMLHttpRequest();
        let url = xhrURL(procedure, data);

        xhr.open('GET', url, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log("200");
                let json = JSON.parse(xhr.responseText);
                if (json[0] !== undefined) {
                    console.log(json[0]);
                    resolve(json[0]);
                } else {
                    reject({
                        status: 404,
                        statusText: "user id not found in db"
                    });
                }
            } else if (this.readyState === 4 && this.status === 404) {
                reject({
                    status: 404,
                    statusText: "unknown error occurred during user group lookup"
                });
            }
        };
    });
}

function addGroupMembers(records, mainUser) {
    console.log(`adding ${records.length} group members`);

    let element = document.getElementById("manage-group-users-div");

    // just reset the group members section for each poll update
    element.innerHTML = "";

    // add our main user back
    element.innerHTML += setUserDivInfo(mainUser, 0);
    styleUserDiv(mainUser, 0);

    for (let i = 0; i < records.length; i++) {
        if (records[i].SystemUserID == mainUser.SystemUserID) {
            continue;
        } else {
            element.innerHTML += setUserDivInfo(records[i], i+1);
            styleUserDiv(records[i], i + 1);
        }
    }
}

function setUserDivInfo(user, index) {
    let color = hashToColor(user.SystemUserID);
    let nameAbbrv = firstTwoLettersOfName(user.Name);

    let html =
    `
        <div id="manage-group-user-div" class="w3-container" onclick="showContextDiv('remove-user-div')">
        <div class="w3-container w3-cell w3-cell-middle">
            <span id="manage-group-user-icon-${index}" class="w3-badge w3-border w3-center user-icon">
            <p id="manage-group-user-icon-text-${index}" class="user-icon-text"></p>
            </span>
        </div>
        <div class="w3-container w3-cell w3-cell-middle">
            <p id="manage-group-user-name-${index}" class="username-text"></p>
            <p id="manage-group-user-email-${index}" class="user-email-text"></p>
        </div>
        <hr>
        </div>
    `;

    return html;
}

function styleUserDiv(user, index) {
    let color = hashToColor(user.SystemUserID);
    let nameAbbrv = firstTwoLettersOfName(user.Name);

    document.getElementById(`manage-group-user-icon-${index}`).style.backgroundColor = color;
    document.getElementById(`manage-group-user-icon-text-${index}`).innerHTML = nameAbbrv;
    document.getElementById(`manage-group-user-name-${index}`).innerHTML = user.Name;
    document.getElementById(`manage-group-user-email-${index}`).innerHTML = user.Email;
}

// App entry point
function onDeviceReady(polling = false) {
    // StatusBar.overlaysWebView(false);
    loadScript('initMap');

    if (polling) {
        setInterval(pollUserUpdates(), 4000);
    }
}

function hideSplash(time, callback) {
    if (test) time = testLoadTime;

    let splash = document.getElementById("app-splash");

    // changing opacity will show the transition
    setTimeout(() => {
        splash.style.opacity = "0";

        // we also have to display none so we can interact with div underneath
        setTimeout(() => {
            splash.style.display = "none";

            // any function to be executed after splash is gone should be done now
            if (typeof callback === 'function') callback();
        }, splashTransition);
    }, time);
}

function initializeLogin(callback) {
    let form = document.getElementById("login-form");
    let image = document.getElementById("login-form-image");
    let formInputs = document.getElementsByClassName("login-form-input");

    // animate logo movement
    setTimeout(() => {
        image.className += " move";

        // animate input appearance
        setTimeout(() => {
            for (let input of formInputs) {
                input.style.opacity = "1";
            }

            // any function to be executed after splash is gone should be done now
            if (typeof callback === 'function') {
                callback();
            }
        }, 100);
    }, 250);
}

// Open sidebar and toggle overlay when clicking the menu icon
function w3_open() {
    document.getElementById("side-nav").style.display = "block";
    document.getElementById("overlay-div").style.display = "block";
}

function w3_close() {
    document.getElementById("side-nav").style.display = "none";
    document.getElementById("overlay-div").style.display = "none";
}

// Show/hide app sections (splash screen, login, and main)
function showSection(sectionID, callback) {

    // get all sections
    let sectionElement = document.getElementById(sectionID);
    let appSections = document.getElementsByClassName("app-section");

    // show the section passed as an arg
    sectionElement.style.display = "block";

    // hide all other sections
    for (let section of appSections) {
        if (section != sectionElement)
            section.style.display = "none";
    }

    // if a function was passed as a param, execute now
    if (typeof callback === 'function') callback();
}

// Show/hide divs when clicking nav links
function showDiv(divID, callback) {

    // get all divs
    let divElement = document.getElementById(divID);
    let appDivs = document.getElementsByClassName("app-div");

    // hide all divs
    for (let div of appDivs) {
        div.style.display = "none";
    }

    // show the div passed as an arg
    divElement.style.display = "block";

    // set the header text to the div name
    document.getElementById("nav-header").innerHTML = divElement.getAttribute("name").toUpperCase();

    // set menu button to a back arrow and change ref when not home screen
    let menuButton = document.getElementById("nav-button");
    let menuButtonIcon = document.getElementById("nav-button-icon");
    if (divID == "map-div") {
        // open the menu as normal
        menuButton.setAttribute("onclick", "w3_open()");
        menuButtonIcon.setAttribute("class", "fa fa-bars");
    } else {
        // show a back button and point onclick to show home screen
        menuButton.setAttribute("onclick", "showDiv('map-div')");
        menuButtonIcon.setAttribute("class", "fa fa-chevron-left");
    }

    // if a function was passed as a param, execute now
    if (typeof callback === 'function') callback();
}

function showContextDiv(divID, callback) {
    let divElement = document.getElementById(divID);
    let overlay = document.getElementById("overlay-div");

    // if a function was passed as a param, execute now
    if (typeof callback === 'function') callback();

    // show the div passed as an arg
    divElement.style.display = "block";

    // toggle overlay
    overlay.style.display = "block";
}

function hideContextDiv(divID) {
    let contextDiv = document.getElementById(divID);
    let overlay = document.getElementById("overlay-div");

    contextDiv.style.display = overlay.style.display = "none";
}

// Load the script required for google maps API
function loadScript(callback) {
    let googleAPIKey = appSettings.googleAPIKey;
    let googleAPIUrl = "https://maps.googleapis.com/maps/api/js";

    let srcURL = googleAPIUrl + '?key=' + googleAPIKey + '&callback=' + callback;

    let script = document.createElement('script');
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    script.src = srcURL;

    document.body.appendChild(script);
}

// Initalize google maps API
function initMap() {

    let mapElement = document.getElementById('map-div');

    let geoLocationASU = {
        lat: 33.4166317,
        lng: -111.9341069
    };
    let mapOptions = {
        zoom: 18,
        center: geoLocationASU
    };

    let mapper = new google.maps.Map(mapElement, mapOptions);

    let markerOptions = {
        position: geoLocationASU,
        map: mapper
    };
    let marker = new google.maps.Marker(markerOptions);
}