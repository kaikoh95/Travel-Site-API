const users = require('../controllers/users.photos.controllers');

module.exports = function(app){
    app.route('/api/v1/users/:userId/photo')
        .get(users.retrieve)
        .put(users.put)
        .delete(users.remove);
};
