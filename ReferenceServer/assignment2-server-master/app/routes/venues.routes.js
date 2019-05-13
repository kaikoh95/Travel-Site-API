const venues = require('../controllers/venues.controller');
const authenticate = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venues.search)
        .post(authenticate.loginRequired, venues.create);

    app.route(app.rootUrl + '/venues/:id')
        .get(venues.viewDetails)
        .patch(authenticate.loginRequired, venues.modify);

    app.route(app.rootUrl + '/categories')
        .get(venues.getCategories);
};
