"use strict";

const dbHelp = require('./dbHelp');
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(UIDGenerator.BASE62);

/* jshint ignore: start */
exports.handler = (event, context, callback) => {
    console.log(0);

    let proc = event.queryStringParameters.procedure;
    let fn = proc ?
        proc.charAt(0).toLowerCase() + proc.substr(1) :
        invalidQueryParameters;

    console.log(fn);

    if (typeof(eval(fn)) == 'function') {
        return eval(fn)(event, callback);
    } else {
        return invalidQueryParameters();
    }
};
/* jshint ignore: end */

const systemUser_Authenticate = (event, callback) => {
    console.log(1);

    let proc = event.queryStringParameters.procedure,
        user = event.queryStringParameters.username;

    let sql = `CALL ${proc}(?)`;
    let conn = dbHelp.dbConnection(3000);

    conn.connect();
    conn.query(sql, user, (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(1.5);
};

const session_Create = (event, callback) => {
    console.log(2);

    let proc = event.queryStringParameters.procedure,
        token = uidgen.generateSync(),
        startTime = event.queryStringParameters.startTime,
        systemUserID = event.queryStringParameters.systemUserID;

    let sql = `CALL ${proc}(?, ?, ?)`;
    let conn = dbHelp.dbConnection(3000);

    conn.connect();
    conn.query(sql, [token, startTime, systemUserID], (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(2.5);
};

const session_Deactivate = (event, callback) => {
    console.log(2);

    let proc = event.queryStringParameters.procedure,
        endTime = event.queryStringParameters.endTime,
        token = event.queryStringParameters.token;

    let sql = `CALL ${proc}(?, ?)`;
    let conn = dbHelp.dbConnection(3000);

    conn.connect();
    conn.query(sql, [endTime, token], (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(2.5);
};

const session_Get = (event, callback) => {
    console.log(3);

    let proc = event.queryStringParameters.procedure,
        token = event.queryStringParameters.token;

    console.log('token param: ' + token);

    let sql = `CALL ${proc}(?)`;
    let conn = dbHelp.dbConnection(3000);

    conn.connect();
    conn.query(sql, token, (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    console.log(results);
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(3.5);
};

const systemUser_Get = (event, callback) => {
    console.log(4);

    let proc = event.queryStringParameters.procedure,
        systemUserID = event.queryStringParameters.systemUserID;

    console.log('systemUserID param: ' + systemUserID);

    let sql = `CALL ${proc}(?)`;
    let conn = dbHelp.dbConnection(5000);

    conn.connect();
    conn.query(sql, systemUserID, (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    console.log(results);
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(4.5);
};

const systemUser_GetGroup = (event, callback) => {
    console.log(5);

    let proc = event.queryStringParameters.procedure,
        currentGroupID = event.queryStringParameters.currentGroupID;

    console.log('currentGroupID param: ' + currentGroupID);

    let sql = `CALL ${proc}(?)`;
    let conn = dbHelp.dbConnection(5000);

    conn.connect();
    conn.query(sql, currentGroupID, (error, results) => {
        if (error) {
            console.log('fail:');
            callback(null, getResponse(404, error));
        } else {
            console.log('success:');
            conn.end((err) => {
                if (err) {
                    console.log('fail:');
                    callback(null, getResponse(404, error));
                } else {
                    console.log(results);
                    callback(null, getResponse(200, results));
                }
            });
        }
    });

    console.log(5.5);
};

const invalidQueryParameters = () => {
    console.log(10);

    return getResponse(404, "Procedure query parameter not valid");
};

const getResponse = (status, content) => {
    console.log(11);

    let response = {
        statusCode: status,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify(content),
    };

    console.log(response);
    return response;
};