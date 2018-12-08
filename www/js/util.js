/* globals google: true, appSettings: true */

"use strict";

function xhrURL(procedure, data) {
    let procParam = encodeQueryData({
        "procedure": procedure
    });
    let queryParams = encodeQueryData(data);

    let url = procParam +
        "&" +
        queryParams;

    return url;
}

function encodeQueryData(queryParams) {
    const encoded = [];
    for (let param in queryParams)
        encoded.push(encodeURIComponent(param) + '=' + encodeURIComponent(queryParams[param]));
    return encoded.join('&');
}

function timeNowMySQL() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function firstTwoLettersOfName(name) {
    if (name === null || name.length < 2)
        return;

    let first, second, delimIndx = name.indexOf(' ');

    first = name.charAt(0).toUpperCase();
    second = delimIndx > 0 ? name.charAt(delimIndx + 1) : name.charAt(1);
    second = second.toUpperCase();

    return String(first + second);
}

function hashToColor(userID) {

    const colors = [
        "64, 196, 171",     // green
        "250, 146, 173",    // pink
        "251, 153, 39",     // orange
        "69, 136, 221",     // blue
        "252, 98, 114",     // red
        "250, 188, 44",     // yellow
        "61, 194, 252",     // lightBlue
    ];

    let index = userID % colors.length;

    return `rgb(${colors[index]})`;
}

function logStatus(method, data, status) {
    console.log(`${method} /?${data} ${status}`);
}