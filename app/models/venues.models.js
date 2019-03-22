const db = require('../../config/db');


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

exports.getVenue = (id, done) => {
    db.getPool().query(
        'SELECT admin_id AS userId, category_id AS categoryId, venue_name AS venueName, city, ' +
        'short_description AS shortDescription, long_description AS longDescription, date_added AS dateAdded, ' +
        'address, latitude, longitude FROM Venue WHERE venue_id = ?',
        [id], function (err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};

// TODO: move to final folder
exports.getPhoto = (id, done) => {
    db.getPool().query(
        'SELECT photo_filename AS photoFilename, photo_description AS photoDescription, is_primary AS isPrimary' +
        ' FROM VenuePhoto WHERE venue_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};