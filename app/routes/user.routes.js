const users = require('../controllers/user.controllers');

module.exports = function(app){
    app.route('/api/v1/users')
        .get(users.list) //debug
        .post(users.create);


};
