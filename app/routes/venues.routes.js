const venues = require('../controllers/venues.controllers');

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