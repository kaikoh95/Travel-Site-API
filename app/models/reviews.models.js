const db = require('../../config/db');

exports.getAll = (id, done) => {
    db.getPool().query(
        'SELECT review_body AS reviewBody, star_rating AS starRating, ' +
        'cost_rating AS costRating, time_posted AS timePosted, review_author_id AS userId FROM Review WHERE reviewed_venue_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
    });
};

exports.insert = (params, done) => {
    let values = [params];
    db.getPool().query('INSERT INTO Review ' +
        '(reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted) VALUES ?',
        values, function(err, results) {
            if (err) return done(err);
            return done(err, results.insertId);
        });
};
//(`reviewed_venue_id`, `review_author_id`, `review_body`, `star_rating`, `cost_rating`, `time_posted`)

exports.retrieveSpecific = (userId, venueId, done) => {
    db.getPool().query(
        'SELECT * FROM Review WHERE (review_author_id=? AND reviewed_venue_id=?)',
        [userId, venueId],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

exports.retrieve = (id, done) => {
    db.getPool().query(
        'SELECT reviewed_venue_id AS venueId, review_body AS reviewBody, star_rating AS starRating, ' +
        'cost_rating AS costRating, time_posted AS timePosted, review_author_id AS userId FROM Review WHERE review_author_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

// TODO: move to venues.models
exports.getVenueFromId = (id, done) => {
    db.getPool().query(
        'SELECT category_id AS categoryId, venue_name AS venueName, city, admin_id AS adminId,' +
        'short_description AS shortDescription, venue_id AS venueId FROM Venue WHERE venue_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};


// TODO: move to final folder
exports.getCategoryFromId = (id, done) => {
    db.getPool().query(
        'SELECT category_name AS categoryName FROM VenueCategory WHERE category_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

// TODO: move to final folder
exports.getPhotoFromId = (id, done) => {
    db.getPool().query(
        'SELECT photo_filename AS primaryPhoto FROM VenuePhoto WHERE (is_primary=1 AND venue_id=?)',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};


