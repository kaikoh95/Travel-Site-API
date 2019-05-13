const usersPhotos = require('../controllers/users.photos.controller');
const authenticate = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(usersPhotos.getProfilePhoto)
        .put(authenticate.loginRequired, usersPhotos.setProfilePhoto)
        .delete(authenticate.loginRequired, usersPhotos.deleteProfilePhoto);
};
