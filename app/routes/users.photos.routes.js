const users = require('../controllers/users.photos.controllers');

/**
 * API method for Users.photos
 * @param app
 */
module.exports = function(app){
    app.route(app.rootUrl + '/users/:userId/photo')
        .get(users.retrieve)
        .put(users.put)
        .delete(users.remove);
};
