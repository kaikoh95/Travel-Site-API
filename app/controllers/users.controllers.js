const User = require('../models/users.models');
const emailvalidator = require("email-validator");
const validator = require('../helpers/validator');
const passwordHash = require('../helpers/password_hash');

exports.list = function(req, res) {
   User.getAll(function(results){
       res.json(results);

   });
};

exports.create = function(req, res) {
    if (!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("email") ||
        !req.body.hasOwnProperty("givenName") || !req.body.hasOwnProperty("familyName") ||
        !req.body.hasOwnProperty("password")) {
        return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
    }

    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };

    if (!emailvalidator.validate(user_data["email"]) || user_data["password"].length < 1 ||
        user_data["givenName"] === "" || user_data["familyName"] === "" || user_data["username"] === "") {
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
            res.status(201).send({"userId": id});
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
                    res.status(200).send({"userId": id, "token": token.toString()});
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
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    User.getOne(id, function(err, results) {
        if (err || !results) {  // no user found
            return res.status(404).send('Not Found: User does not exist');
        }
        let token = req.headers['x-authorization'];
        User.getIdFromToken(token, function(err, userId) {
            if (userId !== id) {
                delete results[0].email;
            }
            return res.status(200).json(results);
        });
    });

};

exports.update = function(req, res) {
    let id = parseInt(req.params.userId);

    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    if (Object.keys(req.body).length === 0) {
        return res.status(400).send('Bad Request: Nothing is provided');
    }

    let token = req.headers['x-authorization'];
    if (token ===  undefined) {
        return res.status(401).send('Unauthorised: Please provide an authentication token');
    } else {
        User.getIdFromToken(token, function(err, userId) {
            if (userId != id) {
                return res.status(403).send('Forbidden: Incorrect authentication token provided');
            } else {
                User.getOne(id, function(err, results) {
                    if (err || !results) {  // no user found
                        return res.status(404).send('Not Found: User does not exist');
                    }

                    let givenName = "";
                    let familyName = "";
                    let password = "";

                    if (req.body.hasOwnProperty("givenName")) {
                        givenName = req.body.givenName;
                    } else {
                        givenName = results[0].givenName;
                    }
                    if (req.body.hasOwnProperty("familyName")) {
                        familyName = req.body.familyName;
                    } else {
                        familyName = results[0].familyName;
                    }

                    if (req.body.hasOwnProperty("password")) {
                        if (req.body.password.length < 1 || !isNaN(req.body.password)) {
                            return res.status(400).send('Bad Request: Invalid password provided');
                        } else {
                            password = passwordHash.getHash(String(req.body.password));
                        }
                    }

                    let data = [givenName, familyName, password];

                    if (familyName === "" || givenName === "") {
                        return res.status(400).send('Bad Request: Invalid fields provided');
                    }
                    if (password === "") {
                        data.pop();
                    }
                    let values = [data];

                    User.amend(id, values, function(err) {
                        if (err) {
                            return res.status(400).send("Bad Request: Unable to process request");
                        }
                        res.status(200).send("OK: Details successfully updated");
                    });

                });
            }
        });
    }
};