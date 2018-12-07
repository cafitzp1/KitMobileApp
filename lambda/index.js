'use strict';

const dbHelp = require('./dbHelp');

/* jshint ignore: start */
exports.handler = (event, context, callback) => {
    console.log(0);

    let proc = event.queryStringParameters.procedure;
    console.log(proc);
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
    console.log(conn);

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

const invalidQueryParameters = () => {
    console.log(2);

    return getResponse(404, "Procedure query parameter not valid");
};

const getResponse = (status, content) => {
    console.log(3);

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