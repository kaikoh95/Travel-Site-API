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
        } else {
            Photo.getPhoto(id, function (err, results) {
                if (err || !results) {
                    return res.status(404).send('Not Found: User has not set a profile photo');
                } else {
                    let file = results[0].profile_photo_filename;
                    if (file === null || file === undefined ) {
                        return res.status(404).send('Not Found: User has not set a profile photo');
                    } else {

                        let filename1 = Buffer.from(file, 'base64');
                        let filename2 = filename1.toString();
                        if (filename2.includes("PNG") || filename2.includes("png")) {
                            res.setHeader("Content-type", "image/png");
                        } else if (
                            filename2.includes("JFIF") || filename2.includes("jfif") ||
                            filename2.includes("JPG") || filename2.includes("JPEG") ||
                            filename2.includes("jpg") || filename2.includes("jpeg")) {
                            res.setHeader("Content-type", "image/jpeg");
                        }
                        return res.status(200).send(filename1);
                    }
                }
            });
        }
    });
};

exports.put = (req, res) => {
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    if (!req.body) {
        return res.status(400).send("Bad Request: Please provide a correct format for photo");
    } else {
        User.getOne(id, function(err, results) {
            if (err || !results) {  // no user found
                return res.status(404).send('Not Found: User does not exist');
            } else {
                let token = req.headers['x-authorization'];
                if (token ===  undefined) {
                    return res.status(401).send('Unauthorised: Please provide an authentication token');
                } else {
                    User.getIdFromToken(token, function(err, userId) {
                        if (userId !== id) {
                            return res.status(403).send('Forbidden: Incorrect authentication token provided');
                        } else {
                            let isCreated = false;
                            let filename = req.body.toString('base64');

                            Photo.getPhoto(id, function (err, results) {
                                if (err || !results) {
                                    isCreated = true;
                                } else {
                                    let file = results[0].profile_photo_filename;
                                    if (file === null || file === undefined ) {
                                        isCreated = true;
                                    } else {
                                        isCreated = false;
                                    }
                                }
                            });
                            Photo.putPhoto(filename, id, function (err, results) {
                                if (err) {
                                    return res.status(400).send("Bad Request: Please provide a correct format for photo");
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
            }
        });
    }
};

exports.remove = (req, res) => {
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    let token = req.headers['x-authorization'];
    if (token === undefined) {
        return res.status(401).send('Unauthorised: Please provide an authentication token');
    } else {
        User.getOne(id, function (err, results) {
            if (err || !results) {  // no user found
                return res.status(404).send('Not Found: User does not exist');
            } else {
                let token = req.headers['x-authorization'];
                if (token === undefined) {
                    return res.status(401).send('Unauthorised: Please provide an authentication token');
                } else {
                    User.getIdFromToken(token, function (err, userId) {
                        if (userId !== id) {
                            return res.status(403).send('Forbidden: Incorrect authentication token provided');
                        } else {
                            Photo.getPhoto(id, function (err, results) {
                                if (err || !results) {
                                    return res.status(404).send('Not Found: User has not set a profile photo');
                                } else {
                                    let file = results[0].profile_photo_filename;
                                    if (file === null || file === undefined) {
                                        return res.status(404).send('Not Found: User has not set a profile photo');
                                    } else {
                                        Photo.deletePhoto(id, function(err, results) {
                                            if (err) {
                                                return res.status(404).send('Not Found: User has not set a profile photo');
                                            } else {
                                                return res.status(200).send("OK: Deleted profile photo");
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    }
};

