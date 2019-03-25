const users = require('../controllers/users.controllers');

/**
 * API methods for Users
 * @param app
 */
module.exports = function(app){
    app.route(app.rootUrl + '/users')
        .post(users.create);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:userId')
        .get(users.read)
        .patch(users.update);


};
