const db = require('../../config/db');

/**
 * Retrieves photo filename from user id
 * @param id
 * @param done
 */
exports.getPhoto = (id, done) => {
    let values = [[id]];
    db.getPool().query(
        'SELECT profile_photo_filename FROM User WHERE user_id=?',
        values,
        function(err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};

/**
 * Sets user profile photo
 * @param filename
 * @param id
 * @param done
 */
exports.putPhoto = (filename, id, done) => {
    let values = [[filename], [id]];
    db.getPool().query(
        'UPDATE User SET profile_photo_filename=? WHERE user_id=?',
        values,
        function(err, result) {
            if (err) {
                return done(err);
            } else {
                return done(err, result);
            }
        });
};

/**
 * Deletes chose photo
 * @param id
 * @param done
 */
exports.deletePhoto = (id, done) => {
    let values = [[id]];
    db.getPool().query(
        'UPDATE User SET profile_photo_filename=NULL WHERE user_id=?',
        values,
        function(err, result) {
            if (err) {
                return done(err);
            } else {
                return done(err, result);
            }
        }
    );
};