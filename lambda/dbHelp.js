"use strict";

const mysql = require('mysql');
const config = require('./config');

const dbHelp = {
    dbConnection: (time = 10000) => {
        let connection = mysql.createConnection({
            user: config.user,
            password: config.password,
            host: config.host,
            database: config.database,
            connectTimeout: time
        });

        return connection;
    }
};

module.exports = dbHelp;