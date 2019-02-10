require('dotenv').config();
const db = require('./config/db');
const express = require('./config/express');

const app = express();
const port = 4941;

// Test connection to MySQL on start-up
async function testDbConnection() {
    console.log(`
    SENG365_PORT: ${process.env.SENG365_PORT}
    SENG365_HOST: ${process.env.SENG365_HOST}
    SENG365_USER: ${process.env.SENG365_USER}
    SENG365_PASSWORD: ${process.env.SENG365_PASSWORD}
    SENG365_DATABASE: ${process.env.SENG365_DATABASE}
    `);
    try {
        await db.createPool();
        await db.getPool().getConnection();
    } catch (err) {
        console.error(`Unable to connect to MySQL: ${err.message}`);
        process.exit(1);
    }
}

testDbConnection()
    .then(function () {
        app.listen(port, function () {
            console.log(`Listening on port: ${port}`);
        });
    });
