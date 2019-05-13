const reviews = require('../controllers/reviews.controller');
const authenticate = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.viewSome)
        .post(authenticate.loginRequired, reviews.postReview);

    app.route(app.rootUrl + '/users/:id/reviews')
        .get(authenticate.loginRequired, reviews.viewUserReviews);
};
