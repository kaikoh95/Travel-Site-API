const db = require('../../config/db');

/**
 * Generic details retrieval from Venue
 * @param done
 */
exports.getAll = (done) => {
    db.getPool().query('SELECT venue_id AS venueId, venue_name AS venueName, category_id AS categoryId,' +
        'city, short_description AS shortDescription, latitude, longitude, admin_id AS adminId FROM Venue', function (err, results) {
        if (err) return done(err);
        return done(err, results);
    });
};

/**
 * Inserts new row into Venue
 * @param venue
 * @param done
 */
exports.insert = (venue, done) => {
    let values = [venue];
    db.getPool().query(
        'INSERT INTO Venue (admin_id, category_id, venue_name, city, short_description, ' +
        'long_description, date_added, address, latitude, longitude ) VALUES ?',
        values, function (err, result) {
            if (err) return done(err);
            return done(err, result.insertId);
    });
};

/**
 * Retrieves specific row of Venue
 * @param id
 * @param done
 */
exports.getVenue = (id, done) => {
    db.getPool().query(
        'SELECT venue_id AS venueId, admin_id AS userId, category_id AS categoryId, venue_name AS venueName, city, ' +
        'short_description AS shortDescription, long_description AS longDescription, date_added AS dateAdded, ' +
        'address, latitude, longitude FROM Venue WHERE venue_id = ?',
        [id], function (err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};

/**
 * Updates Venue with info supplied
 * @param values
 * @param done
 */
exports.updateVenue = (values, done) => {
    db.getPool().query(
        'UPDATE Venue SET venue_name=?, category_id=?, city=?, short_description=?, ' +
        'long_description=?, address=?, latitude=?, longitude=? WHERE venue_id=?',
        values, function (err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};