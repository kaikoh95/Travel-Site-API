const venues = require('../controllers/venues.photos.controllers');

module.exports = function(app){
    app.route(app.rootUrl + '/venues/:venueId/photos')
        .post(venues.addPhoto);

    app.route(app.rootUrl + '/venues/:venueId/photos/:photoFilename')
        .get(venues.getPhoto)
        .delete(venues.deletePhoto);

    app.route(app.rootUrl + '/venues/:venueId/photos/:photoFilename/setPrimary')
        .post(venues.setPrimary);
};