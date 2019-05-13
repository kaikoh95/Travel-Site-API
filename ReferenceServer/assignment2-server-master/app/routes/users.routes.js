const users = require('../controllers/users.controller');
const authenticate = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/users')
        .post(users.create);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(authenticate.loginRequired, users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(authenticate.setAuthenticatedUser, users.view)
        .patch(authenticate.loginRequired, users.change);
};
