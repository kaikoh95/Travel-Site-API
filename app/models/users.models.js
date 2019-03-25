const db = require('../../config/db');
const passwordHash = require('../helpers/password_hash');
const crypto = require('crypto');

/**
 * Creates new user in the database
 * @param user - contains user details supplied from the request body
 * @param done - Checker to be returned
 */
exports.insert = (user, done) => {
    let values = [user];
    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?',
        values, function(err, results) {
        if (err) return done(err);
            return done(err, results.insertId);
    });
};

/**
 * Authenticates user login based on username/email AND password provided
 * @param username - String of username
 * @param email - String of user email
 * @param password - String of user password
 * @param done - Checker to be returned
 */
exports.authenticate = (username, email, password, done) => {
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
        function(err, results) {
            if (results['changedRows'] == 0) {
                return done(true); // no changes = not authorized
            }
            return done(false, results);
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

exports.setToken = (id, done) => {
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

exports.getOne = (userId, done) => {
    db.getPool().query(
        'SELECT username, email, given_name AS givenName,' +
        'family_name AS familyName FROM User WHERE user_id = ?',
        userId, function (err, results) {
            if (err || results.length < 1) {
                return done(true);
            } else {
                done(false, results);
            }
        });
};

/**
 * Gets ID from authentication token provided as a form of authorization
 * @param token - Auth token provided
 * @param done - Checker
 * @returns {*} - query from SQL
 */

exports.getIdFromToken = (token, done) => {
    if (token === undefined || token === null) {
        return done(true, null);
    } else {
        db.getPool().query(
            'SELECT user_id FROM User WHERE auth_token=?',
            [token],
            function(err, result) {
                if (result.length === 1)
                    return done(null, result[0].user_id);
                return done(err, null);
            });
    }
};

/**
 * Amends user details based on information provided
 * @param id - User ID
 * @param values - User details to be amended
 * @param done - Checker
 */

exports.amend = (id, values, done) => {
    let querySQL = '';

    if (values.length > 3) {
        querySQL = 'UPDATE User SET given_name=?, family_name=?, password=? WHERE user_id=?';
    } else {
        querySQL = 'UPDATE User SET given_name=?, family_name=? WHERE user_id=?';
    }

    values[0].push(id);
    db.getPool().query(querySQL, values[0], function(err, results) {
        if (err) return done(err);
        done(err, results);
    });
};

/**
 * Obtains username from given user ID
 * @param userId - User ID
 * @param done - Checker
 */
exports.getNameFromId = (userId, done) => {
    db.getPool().query(
        'SELECT username FROM User WHERE user_id = ?',
        userId, function (err, results) {
            if (err || results.length < 1) {
                return done(true);
            } else {
                done(false, results);
            }
        });
};