const venues = require('../controllers/venues.controllers');

/**
 * API methods for venues
 * @param app
 */
module.exports = function(app){
    app.route(app.rootUrl + '/venues')
        .get(venues.list)
        .post(venues.create);

    app.route(app.rootUrl + '/venues/:venueId')
        .get(venues.getOne)
        .patch(venues.update);

    app.route(app.rootUrl + '/categories')
        .get(venues.getCategory);
    
};