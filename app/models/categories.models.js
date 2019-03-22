const db = require('../../config/db');

exports.getCategoryFromId = (id, done) => {
    db.getPool().query(
        'SELECT category_name AS categoryName FROM VenueCategory WHERE category_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

exports.getCategory = (id, done) => {
    db.getPool().query(
        'SELECT category_name AS categoryName, category_description AS categoryDescription FROM VenueCategory WHERE category_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};