const User = require('../models/user.models');
const emailvalidator = require("email-validator");
const validator = require('../helpers/validator');
const passwordHash = require('../helpers/password_hash');

exports.list = function(req, res){
   User.getAll(function(results){
       res.json(results);

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

    if (!emailvalidator.validate(user_data["email"]) || user_data["password"].length < 1 ||
        user_data["givenName"] === "" || user_data["familyName"] === "") {
        return res.status(400).send('Bad Request: One or more required field is missing/incorrect');

    } else {
        let username = user_data['username'].toString();
        let email = user_data['email'].toString();
        let givenName = user_data['givenName'].toString();
        let familyName = user_data['familyName'].toString();
        let password = user_data['password'].toString();

        const hash = passwordHash.getHash(password);

        let values = [
            [username, email, givenName, familyName, hash]
        ];
        User.insert(values, function(err, id){
            if (err) {
                return res.status(400).send("Bad Request: Duplicate username/email found");
            }
            res.status(201).send({"userId": id.toString()});
        });
    }
};

exports.login = function(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    if (username === "" && email === "") {
        return res.status(400).send("Bad Request: Username/Email required");
    } else {
        User.authenticate(username, email, password, function(err, id){
            if (err) {
                res.status(400).send('Bad Request: Invalid credentials supplied');
            } else {
                User.setToken(id, function(err, token) {
                    res.status(200).send({"userId": id.toString(), "token": token.toString()});
                });
            }
        });
    }
};

exports.logout = function(req, res) {
    let token = req.headers['x-authorization'];
    User.removeToken(token, function(err){
        if (token === "" || err){
            return res.status(401).send("Unauthorized: You do not have the permission to do so");
        } else {
            return res.status(200).send("OK: Logged out successfully");
        }
    });
};

exports.read = function(req, res) {
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Incorrect ID provided');

    User.getOne(id, function(err, results) {
        if (err) {  // no user found
            return res.status(404).send('Not Found: User does not exist');
        }
        if (results[0].token === null) {
            delete results[0].email;
        }
        delete results[0].token;
        res.status(200).json(results);
    });

};

exports.update = function(req, res) {

}