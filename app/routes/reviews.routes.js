const reviews = require('../controllers/reviews.controllers');

module.exports = function(app){
    app.route(app.rootUrl + '/venues/:venueId/reviews')
        .get(reviews.list)
        .post(reviews.create);

    app.route(app.rootUrl + '/users/:userId/reviews')
        .get(reviews.getOne);
};