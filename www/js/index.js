/* jshint browser: true */
/* jshint jquery: true */
/* globals google: true, appSettings: true */

"use strict";

const test = false;                 // set to true for testing, false for production
const loadTime = 3000;              // load time when test is set to false
const testLoadTime = 700;           // load time when test is set to true
const splashTransition = 500;       // time for the splash screen transition to login
const testDiv = 'manage-group';     // if test is set to true, this div will immediately open

// immeditately invoked function expression
{
    // wait until all phonegap/cordova is loaded then fire start up events
    window.addEventListener("load", onDeviceReady);
    document.addEventListener("deviceready", onDeviceReady, false);

    // start with the login section
    showSection("app-login");

    // hide splash after 3s
    if (loadTime) hideSplash(loadTime, initializeLogin);

    if (test) {
        document.getElementById("login-button").click();
        document.getElementById(`${testDiv}-side-nav-button`).click();
    }
}

function initializeHomePage() {
    showSection("app-main");
    document.getElementById('nav-header').click();
}

// App entry point
function onDeviceReady() {
	// StatusBar.overlaysWebView(false);
	loadScript('initMap');
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

function initializeLogin() {
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
            if (typeof callback === 'function') callback();
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

    console.log('clicked');
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

	let srcURL 		 = googleAPIUrl + '?key=' + googleAPIKey + '&callback=' + callback;

	let script 		 = document.createElement('script');
	script.type 	 = "text/javascript";
	script.async 	 = true;
	script.defer 	 = true;
	script.src 		 = srcURL;

	document.body.appendChild(script);
}

// Initalize google maps API
function initMap() {

    let mapElement 		= document.getElementById('map-div');
    
    let geoLocationASU 	= {lat: 33.4166317, lng: -111.9341069};
    let mapOptions 		= {zoom: 18, center: geoLocationASU};

    let mapper = new google.maps.Map(mapElement, mapOptions);

    let markerOptions 	= {position: geoLocationASU, map: mapper};
    let marker = new google.maps.Marker(markerOptions);
}