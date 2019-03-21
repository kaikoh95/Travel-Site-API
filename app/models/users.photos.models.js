const db = require('../../config/db');

exports.getPhoto = (id, done) => {
    let values = [id];
    db.getPool().query(
        'SELECT profile_photo_filename FROM User WHERE user_id=?',
        values,
        function(err, result) {
            if (err) return done(err);
            return done(err, result);
        });
};

exports.putPhoto = (filename, id, done) => {
    let values = [[filename], [id]];
    db.getPool().query(
        'UPDATE User SET profile_photo_filename=? WHERE user_id=?',
        values,
        function(err, result) {
            if (err){
                return done(err);
            } else {
                return done(err, result);
            }
        });
};

exports.deletePhoto = (req, res) => {

};