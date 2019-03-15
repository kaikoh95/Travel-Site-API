const db = require('../../config/db');
const passwordHash = require('../helpers/password_hash');
const crypto = require('crypto');

exports.getAll = function(done){
    db.getPool().query('SELECT * FROM User', function (err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

/**
 * Creates new user in the database
 * @param user - contains user details supplied from the request body
 * @param done - Checker to be returned
 */
exports.insert = function(user, done){
    let values = [user];
    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?',
        values, function(err, results) {
        if (err) return done(err);
            return done(err, results.insertId)
    });
};

/**
 * Authenticates user login based on username/email AND password provided
 * @param username - String of username
 * @param email - String of user email
 * @param password - String of user password
 * @param done - Checker to be returned
 */
exports.authenticate = function(username, email, password, done){
    db.getPool().query(
        'SELECT user_id, password FROM User WHERE (username=? OR email=?)',
        [username, email],
        function (err, results) {
            if (err || results.length !== 1){
                return done(true); // failed authentication
            } else {
                if (results[0].password === passwordHash.getHash(password)){
                    return done(false, results[0].user_id);
                }else{
                    return done(true); // failed password check
                }
            }
        });
};


/**
 * Removes token from user and there for deauthorises user from the account
 * @param token - Auth token provided
 * @param done - Checker to be returned
 */
exports.removeToken = (token, done) => {
    db.getPool().query(
        "UPDATE User SET auth_token=null WHERE auth_token=?",
        [token],
        function(err){
            return done(err)
        }
    );
};

/**
 * Creates and stores Auth token for user
 *  -- NOTE: In real world applications, it is not advised to store tokens together with User.
 *  -- NOTE: In fact, tokens should not even be stored in the database.
 * @param id - User ID provided
 * @param done - Checker to be returned
 */

exports.setToken = function(id, done){
    let token = crypto.randomBytes(16).toString('hex');
    db.getPool().query(
        'UPDATE User SET auth_token=? WHERE user_id=?',
        [token, id],
        function(err){
            return done(err, token)
        }
    );
};

/**
 * Gets details of user based on ID provided
 * @param userId - User ID provided
 * @param done - Checker to be returned
 */

exports.getOne = function(userId, done){
    db.getPool().query(
        'SELECT username, email, given_name AS givenName,' +
        'family_name AS familyName, auth_token AS token FROM User WHERE user_id = ?',
        userId, function (err, results) {
            if (err || results.length < 1) {
                return done(true);
            } else {
                done(false, results);
            }
        });
};