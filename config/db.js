const mysql = require('promise-mysql');

let pool = null;

exports.createPool = async function () {
    pool = mysql.createPool({
        multipleStatements: true,
        host: process.env.SENG365_HOST,
        user: process.env.SENG365_USER,
        password: process.env.SENG365_PASSWORD,
        database: process.env.SENG365_DATABASE
    });
};

exports.getPool = function () {
    return pool;
};
