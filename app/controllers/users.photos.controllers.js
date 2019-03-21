const Photo = require('../models/users.photos.models');
const User = require('../models/users.models');
const validator = require('../helpers/validator');
const fs = require('fs');
const path = require('path');
const dir = path.dirname(require.main.filename);

exports.retrieve = (req, res) => {
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    User.getOne(id, function(err, results) {
        if (err || !results) {  // no user found
            return res.status(404).send('Not Found: User does not exist');
        }
    });

    Photo.getPhoto(id, function (err, results) {
        if (err || !results) {
            return res.status(404).send('Not Found: User has not set a profile photo');
        } else {

            let file = results[0].profile_photo_filename;
            console.log(file);

            let filename1 = Buffer.from(file, 'base64');
            console.log(filename1);

            let filename2 = filename1.toString();
            if (filename2.includes("PNG") || filename2.includes("png")) {
                res.set("Content-Type", 'image/png');
                res.status(200).send(filename1);
                return res;
            } else if (
                filename2.includes("JFIF") || filename2.includes("jfif") ||
                filename2.includes("JPG") || filename2.includes("JPEG") ||
                filename2.includes("jpg") || filename2.includes("jpeg")) {

                res.set("Content-Type", 'image/jpg');
                res.status(200).send(filename1);
                return res;
            }
        }
    });

};

exports.put = (req, res) => {
    console.log((req.body));
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    User.getOne(id, function(err, results) {
        if (err || !results) {  // no user found
            return res.status(404).send('Not Found: User does not exist');
        }
    });

    let token = req.headers['x-authorization'];
    if (token ===  undefined) {
        return res.status(401).send('Unauthorised: Please provide an authentication token');
    } else {
        User.getIdFromToken(token, function(err, userId) {
            if (userId !== id) {
                return res.status(403).send('Forbidden: Incorrect authentication token provided');
            } else {
                let isCreated = false;
                let filename = Buffer.from(req.body, 'base64').toString('base64');
                console.log((filename));

                Photo.getPhoto(id, function (err, results) {
                    if (err || !results) {
                        isCreated = true;
                    } else {
                        isCreated = false;
                    }
                });
                Photo.putPhoto(filename, id, function (err, results) {
                    if (err) {
                        return res.status(400).send("Bad Request: Wrong photo format");
                    } else {
                        if (isCreated === true) {
                            return res.status(201).send("Created: Set Profile Photo");
                        } else {
                            return res.status(200).send("OK: Updated Profile Photo");
                        }
                    }
                });
            }
        });
    }
};

exports.remove = (req, res) => {
    //User.deletePhoto
};