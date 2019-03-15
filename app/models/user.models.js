const db = require('../../config/db');

exports.getAll = function(done){
    db.getPool().query('SELECT * FROM User', function (err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });

};

exports.getOne = function(userId, done){
    db.getPool().query('SELECT * FROM User WHERE user_id = ?',
        userId, function (err, rows) {
        if (err) return done(err);
        done(rows);
    }); };

exports.insert = function(user, done){

    let values = [user];
    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?',
        values, function(err, result) {
        if (err) return done(err);
            return done(err, result.insertId)
    });
};