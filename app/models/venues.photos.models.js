const db = require('../../config/db');

/**
 * Retrieves single photo via given venue id
 * @param id
 * @param done
 */
exports.getPhoto = (id, done) => {
    db.getPool().query(
        'SELECT photo_filename AS photoFilename, photo_raw AS photoRaw, photo_description AS photoDescription, is_primary AS isPrimary' +
        ' FROM VenuePhoto WHERE venue_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

/**
 * Identifies and retrieves primary photo of venue from venue id
 * @param id
 * @param done
 */
exports.getPhotoFromId = (id, done) => {
    db.getPool().query(
        'SELECT photo_filename AS primaryPhoto FROM VenuePhoto WHERE (is_primary=1 AND venue_id=?)',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

/**
 * Retrieves photo details from given photo filename
 * @param values
 * @param done
 */
exports.getPhotoFromName = (values, done) => {
    db.getPool().query(
        'SELECT photo_filename AS photoFilename, photo_raw AS photoRaw, photo_description AS photoDescription, is_primary AS isPrimary' +
        ' FROM VenuePhoto WHERE (venue_id=? AND photo_filename=?)',
        values,
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

/**
 * Creates new photo row
 * @param values
 * @param done
 */
exports.insertPhoto = (values, done) => {
    db.getPool().query(
        'INSERT INTO VenuePhoto (venue_id, photo_filename, photo_raw, photo_description, is_primary) VALUES ?',
        [values], function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

/**
 * updates photo
 * @param values
 * @param done
 */
exports.updatePhoto = (values, done) => {
    db.getPool().query(
        'UPDATE VenuePhoto SET is_primary=? WHERE (venue_id=? AND photo_filename=?)',
        values, function (err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};

/**
 * Deletes photos from a venue
 * @param values
 * @param done
 */
exports.deletePhoto = (values, done) => {
    db.getPool().query(
        'DELETE FROM VenuePhoto WHERE (venue_id=? AND photo_filename=?)',
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