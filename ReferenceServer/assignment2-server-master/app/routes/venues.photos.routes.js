const venuesPhotos = require('../controllers/venues.photos.controller');
const authenticate = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/photos')
        .post(authenticate.loginRequired, venuesPhotos.addVenuePhoto);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename')
        .get(venuesPhotos.getVenuePhoto)
        .delete(authenticate.loginRequired, venuesPhotos.deleteVenuePhoto);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename/setPrimary')
        .post(authenticate.loginRequired, venuesPhotos.setPrimaryVenuePhoto);
};
