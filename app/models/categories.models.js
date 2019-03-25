const db = require('../../config/db');

/**
 * Obtain category name via category id
 * @param id
 * @param done
 */
exports.getCategoryFromId = (id, done) => {
    db.getPool().query(
        'SELECT category_name AS categoryName FROM VenueCategory WHERE category_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};

/**
 * Obtain categories details via category id
 * @param id
 * @param done
 */
exports.getCategories = (id, done) => {
    db.getPool().query(
        'SELECT category_name AS categoryName, category_description AS categoryDescription FROM VenueCategory WHERE category_id=?',
        [id],
        function(err, results) {
            if (err) return done(err);
            return done(err, results);
        });
};


/**
 * Generic Get All categories
 * @param done
 */
exports.getAllCategories = (done) => {
    db.getPool().query(
        'SELECT category_id AS categoryId, category_name AS categoryName, category_description AS categoryDescription ' +
        'FROM VenueCategory',
        function (err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};