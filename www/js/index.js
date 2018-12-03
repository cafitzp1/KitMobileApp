/* jshint browser: true */
/* jshint jquery: true */
/* globals google: true, appSettings: true */

"use strict";

// IIFE: wait until all phonegap/cordova is loaded then call onDeviceReady
{
    window.addEventListener("load", onDeviceReady);
    document.addEventListener("deviceready", onDeviceReady, false);
}

// App entry point
function onDeviceReady(){
	// StatusBar.overlaysWebView(false);
	loadScript('initMap');
}

// Open sidebar and toggle overlay when clicking the menu icon
function w3_open() {
    document.getElementById("side-nav").style.display = "block";
    document.getElementById("nav-overlay").style.display = "block";
}

function w3_close() {
    document.getElementById("side-nav").style.display = "none";
    document.getElementById("nav-overlay").style.display = "none";
}

// Show/hide divs when clicking nav links
function showDiv(divID, done) {

    // get all divs
    let divElement = document.getElementById(divID);
    let appSections = document.getElementsByClassName("app-section");

    // hide all divs
    for (let section of appSections) {
        section.style.display = "none";
    }

    // show the div passed as an arg, hide the side nav
    divElement.style.display = "block";
    done();
}

// Load the script required for google maps API
function loadScript(callback) {
	let googleAPIKey = appSettings.googleAPIKey;
	let googleAPIUrl = "https://maps.googleapis.com/maps/api/js";

	let srcURL 		 = googleAPIUrl + '?key=' + googleAPIKey 
							+ '&callback=' + callback;

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