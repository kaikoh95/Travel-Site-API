const Venue = require('../models/venues.models');
const VenuePhoto = require('../models/venues.photos.models');
const User = require('../models/users.models');
const validator = require('../helpers/validator');
const randomInt = require('../helpers/generate_random_integer');

exports.addPhoto = function (req, res) {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function(err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            let venueId = id;
            let adminId = results[0].userId;
            let token = req.headers['x-authorization'];
            if (token ===  undefined) {
                return res.status(401).send('Unauthorised: Please provide an authentication token');
            } else {
                User.getIdFromToken(token, function (err, userId) {
                    if (err || !userId || userId.length < 1) {
                        return res.status(401).send('Unauthorised: Incorrect authentication token provided');
                    } else { // authenticated
                        if (userId !== adminId) {
                            return res.status(403).send('Forbidden: You are not the admin of the site');
                        } else {
                            if (req.files.constructor === Object && Object.keys(req.files).length !== 1) {
                                return res.status(400).send('Bad Request: Please just provide one photo');
                            }
                            if (req.body.constructor === Object && Object.keys(req.body).length !== 2) {
                                return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                            }
                            if (!req.body.hasOwnProperty("description") || !req.body.hasOwnProperty("makePrimary")) {
                                return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                            }
                            if (!Number.isInteger(Number(req.body.makePrimary)) || req.body.description === "") {
                                return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                            }
                            let photoArray = req.files.photo;
                            let photoRaw = photoArray.data;
                            let photoRawString = photoRaw.toString('base64');
                            let photoName = photoArray.name;

                            let photoDescription = req.body.description;
                            let makePrimary = Number(req.body.makePrimary);

                            VenuePhoto.getPhoto(venueId, function(err, photos) {
                                if (err || !photos || photos.length < 1) {
                                    makePrimary = 1;
                                } else {
                                    photos.forEach(function (result) {
                                        if (makePrimary === 1) {
                                            let updateArray = [0, venueId, result.photoFilename]
                                            VenuePhoto.updatePhoto(updateArray, function(error) {
                                                if (error) {
                                                    return res.status(400).send("Bad Request: Unable to process request");
                                                }
                                            });
                                        } else if (makePrimary === 0) {
                                            if (result.isPrimary === 0) {
                                                makePrimary = 1;
                                            } else if (result.isPrimary === 1) {
                                                makePrimary = 0;
                                            }
                                        }
                                    });
                                }
                            });
                            let putData = [[venueId, photoName, photoRawString, photoDescription, makePrimary]];
                            VenuePhoto.insertPhoto(putData, function(err) {
                                if (err) {
                                    return res.status(400).send("Bad Request: Duplicate photos found");
                                }
                                return res.status(201).send("Created: Successfully photo");
                            });
                        }
                    }
                });
            }
        }
    });
};

exports.getPhoto = function (req, res) {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function(err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            if (req.params.length < 2 || !req.params.hasOwnProperty("photoFilename")) {
                return res.status(400).send('Bad Request: One or more required params is missing/incorrect');
            }
            let venueId = id;
            let filename = req.params.photoFilename;
            VenuePhoto.getPhoto(venueId, function(err, photos) {
                if (err || !photos || photos.length < 1) {
                    return res.status(404).send('Not Found: Photo does not exist');
                } else {
                    photos.forEach(function (photo) {
                        let resultFilename = photo.photoFilename;
                        if (resultFilename === filename) {
                            let bufferPhoto = photo.photoRaw;
                            let filename1 = Buffer.from(bufferPhoto, 'base64');
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
                    });
                    return res.status(404).send('Not Found: Photo does not exist');
                }
            });
        }
    });
};

exports.deletePhoto = function (req, res) {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function (err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            if (req.params.length < 2 || !req.params.hasOwnProperty("photoFilename")) {
                return res.status(400).send('Bad Request: One or more required params is missing/incorrect');
            }
            let photoName = String(req.params.photoFilename);
            let venueId = id;
            let adminId = results[0].userId;
            let token = req.headers['x-authorization'];
            if (token === undefined) {
                return res.status(401).send('Unauthorised: Please provide an authentication token');
            } else {
                User.getIdFromToken(token, function (err, userId) {
                    if (err || !userId || userId.length < 1) {
                        return res.status(401).send('Unauthorised: Incorrect authentication token provided');
                    } else { // authenticated
                        if (userId !== adminId) {
                            return res.status(403).send('Forbidden: You are not the admin of the site');
                        } else { //is admin
                            let values = [venueId, photoName];
                            VenuePhoto.getPhotoFromName(values, function(err, photo) {
                                if (err || !photo || photo.length < 1) {
                                    return res.status(404).send('Not Found: Photo does not exist');
                                } else {
                                    let isPrimary = photo[0].isPrimary;
                                    VenuePhoto.getPhoto(venueId, function(err, getAllPhotos) {
                                        if (err || !getAllPhotos || getAllPhotos.length < 1) {
                                            return res.status(404).send('Not Found: No photo exists');
                                        } else {
                                            if (getAllPhotos.length < 2) {
                                                VenuePhoto.deletePhoto(values, function(err, photos) {
                                                    if (err || !photos || photos.length < 1) {
                                                        return res.status(404).send('Not Found: Photo does not exist');
                                                    } else {
                                                        return res.status(200).send("OK: Deleted photo");
                                                    }
                                                });
                                            } else {
                                                VenuePhoto.deletePhoto(values, function(err, photos) {
                                                    if (err || !photos || photos.length < 1) {
                                                        return res.status(404).send('Not Found: Photo does not exist');
                                                    } else {
                                                        VenuePhoto.getPhoto(venueId, function(err, allPhotos) {
                                                            if (err || !allPhotos || allPhotos.length < 1) {
                                                                return res.status(404).send('Not Found: No photo exists');
                                                            } else {
                                                                if (allPhotos.length === 1) {
                                                                    let filenameToChange = allPhotos[0].photoFilename;
                                                                    let updateArray = [1, venueId, filenameToChange];
                                                                    VenuePhoto.updatePhoto(updateArray, function(error) {
                                                                        if (error) {
                                                                            return res.status(404).send('Not Found: No photo exists');
                                                                        }
                                                                    });
                                                                }
                                                                if (isPrimary === 1) {
                                                                    let randomInteger = randomInt.getRandomInt(0, allPhotos.length);
                                                                    let filenameToChange = allPhotos[randomInteger].photoFilename;
                                                                    let updateArray = [1, venueId, filenameToChange];
                                                                    VenuePhoto.updatePhoto(updateArray, function(error) {
                                                                        if (error) {
                                                                            return res.status(404).send('Not Found: No photo exists');
                                                                        }
                                                                    });
                                                                }
                                                                return res.status(200).send("OK: Deleted photo");
                                                            }
                                                        });
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
        }
    });
};

exports.setPrimary = function (req, res) {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function (err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            if (req.params.length < 2 || !req.params.hasOwnProperty("photoFilename")) {
                return res.status(400).send('Bad Request: One or more required params is missing/incorrect');
            }
            let photoName = String(req.params.photoFilename);
            let venueId = id;
            let adminId = results[0].userId;
            let token = req.headers['x-authorization'];
            if (token === undefined) {
                return res.status(401).send('Unauthorised: Please provide an authentication token');
            } else {
                User.getIdFromToken(token, function (err, userId) {
                    if (err || !userId || userId.length < 1) {
                        return res.status(401).send('Unauthorised: Incorrect authentication token provided');
                    } else { // authenticated
                        if (userId !== adminId) {
                            return res.status(403).send('Forbidden: You are not the admin of the site');
                        } else { //is admin
                            let values = [venueId, photoName];
                            VenuePhoto.getPhotoFromName(values, function(err, photo) {
                                if (err || !photo || photo.length < 1) {
                                    return res.status(404).send('Not Found: Photo does not exist');
                                } else {
                                    VenuePhoto.getPhoto(venueId, function(err, allPhotos) {
                                        if (err || !allPhotos || allPhotos.length < 1) {
                                            return res.status(404).send('Not Found: Photo does not exist');
                                        } else {
                                            allPhotos.forEach(function (photo) {
                                                if (photo.photoFilename !== photoName) {
                                                    let updateArray = [0, venueId, photo.photoFilename];
                                                    VenuePhoto.updatePhoto(updateArray, function(error) {
                                                        if (error) {
                                                            return res.status(400).send("Bad Request: Unable to process request");
                                                        }
                                                    });
                                                }
                                            });
                                            let data = [1, venueId, photoName];
                                            console.log(photoName)
                                            VenuePhoto.updatePhoto(data, function(error) {
                                                if (error) {
                                                    return res.status(404).send('Not Found: Photo does not exist');
                                                } else {
                                                    return res.status(200).send("OK: Set Primary");
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};