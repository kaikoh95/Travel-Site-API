const User = require('../models/user.models');
const emailvalidator = require("email-validator");
const schema = require('../resources/seng365_travel_site_api_spec.json');
const validator = require('../helpers/validator');
const crypto = require('crypto');

const getHash = function(password){
    const salt = crypto.randomBytes(64);
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

exports.list = function(req, res){
   User.getAll(function(result){
       res.json(result);

   });
};

exports.read = function(req, res){
    let id = req.params.userId;
    User.getOne(id, function(result){
        res.json(result);
    });

};

exports.create = function(req, res){
    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };

    if (!emailvalidator.validate(user_data["email"]) || user_data["password"].length < 1) {
        return res.status(400).send('Bad request: One or more required key is missing/incorrect');

    } else {
        console.log(user_data);
        let username = user_data['username'].toString();
        let email = user_data['email'].toString();
        let givenName = user_data['givenName'].toString();
        let familyName = user_data['familyName'].toString();
        let password = user_data['password'].toString();

        const hash = getHash(password);

        let values = [
            [username, email, givenName, familyName, hash]
        ];
        User.insert(values, function(err, id){
            if (err) {
                return res.sendStatus(400); // duplicate record
            }
            res.status(201).send({"userId": id.toString()});
        });
    }
};