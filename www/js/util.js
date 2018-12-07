/* globals google: true, appSettings: true, apigClientFactory: true */

'use strict';

function xhrURL(procedure, data) {
    let procParam = encodeQueryData({
        "procedure": procedure
    });
    let queryParams = encodeQueryData(data);

    let url = appSettings.apigURL +
        "?" +
        procParam +
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