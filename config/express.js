const express = require('express');
const bodyParser = require('body-parser');

const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
};

module.exports = function () {
    const app = express();

    // MIDDLEWARE
    app.use(allowCrossOriginRequests);
    app.use(bodyParser.json());

    // ROUTES
    require('../app/routes/backdoor.routes')(app);

    // DEBUG (you can remove this)
    app.get('/', function (req, res) {
        res.send({ "message": "Hello World!" })
    });

    return app;
};
