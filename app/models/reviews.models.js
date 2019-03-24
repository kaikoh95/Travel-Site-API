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

