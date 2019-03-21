const users = require('../controllers/users.controllers');

module.exports = function(app){
    app.route(app.rootUrl + '/users')
        .get(users.list) //debug
        .post(users.create);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:userId')
        .get(users.read)
        .patch(users.update);


};
