const express = require('express');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');


const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
};

module.exports = function () {
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequests);
    app.use(bodyParser.json());

    app.use(bodyParser.raw({type: 'text/plain', limit: '50mb', extended: true}));  // for the /executeSql endpoint
    app.use(bodyParser.raw({type: 'image/png', limit: '50mb', extended: true}));
    app.use(bodyParser.raw({type: 'image/jpeg', limit: '50mb', extended: true}));
    app.use(bodyParser.raw({type: 'image/jpg', limit: '50mb', extended: true}));
    app.use(busboyBodyParser());
    app.use(express.static('../app/photos'));

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/users.routes')(app);
    require('../app/routes/users.photos.routes')(app);
    require('../app/routes/reviews.routes')(app);
    require('../app/routes/venues.routes')(app);
    require('../app/routes/venues.photos.routes')(app);

    return app;
};
