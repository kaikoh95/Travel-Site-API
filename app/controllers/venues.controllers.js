const Venue = require('../models/venues.models');
const User = require('../models/users.models');
const Category = require('../models/categories.models');
const validator = require('../helpers/validator');

exports.list = function (req, res) {

};

exports.create = function (req, res) {
    let token = req.headers['x-authorization'];
    if (token ===  undefined) {
        return res.status(401).send('Unauthorised: Please provide an authentication token');
    } else {
        User.getIdFromToken(token, function (err, id) {
            if (err || !id || id.length < 1) {
                return res.status(401).send('Unauthorised: Incorrect authentication token provided');
            } else { // authenticated
                let userId = id;
                if (req.body.length < 8 ||
                    !req.body.hasOwnProperty("venueName") || !req.body.hasOwnProperty("categoryId") ||
                    !req.body.hasOwnProperty("city") || !req.body.hasOwnProperty("shortDescription") ||
                    !req.body.hasOwnProperty("longDescription") || !req.body.hasOwnProperty("address") ||
                    !req.body.hasOwnProperty("latitude") || !req.body.hasOwnProperty("longitude")) {
                    return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                }
                let currentDate = new Date();
                let data = {
                    "adminId": userId,
                    "categoryId": Number(req.body.categoryId),
                    "venueName": req.body.venueName,
                    "city": req.body.city,
                    "shortDescription": req.body.shortDescription,
                    "longDescription": req.body.longDescription,
                    "date": currentDate,
                    "address": req.body.address,
                    "latitude": Number(req.body.latitude),
                    "longitude": Number(req.body.longitude)
                };

                if (!Number.isInteger(data["categoryId"]) || data["venueName"] === "" ||
                    data["city"] === "" || data["shortDescription"] === "" || data["longDescription"] === "" ||
                    data["address"] === "" || isNaN(data["latitude"]) || isNaN(data["longitude"]) ||
                    data["latitude"] > 90.0 || data["longitude"] < -180.0) {
                    return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                }

                Category.getCategoryFromId(data["categoryId"], function(err, categoryName) {
                    if (err || !categoryName || categoryName.length < 1) {
                        return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                    } else {
                        let values = [
                            [
                                userId,
                                data["categoryId"], data["venueName"],
                                data["city"], data["shortDescription"],
                                data["longDescription"], currentDate,
                                data["address"], data["latitude"],
                                data["longitude"]
                            ]
                        ];

                        Venue.insert(values, function(err, id){
                            if (err) {
                                return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                            }
                            res.status(201).send({"venueId": id});
                        });

                    }
                });

            }
        });
    }
};

exports.getOne = function (req, res) {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function(err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            let venueName = results[0].venueName;
            let userId = results[0].userId;
            User.getNameFromId(userId, function(err, name) {
                if (err || !name || name.length < 1) {  // no user found
                    return res.status(500).send('Internal Server Error: No user found');
                } else {
                    let username = name[0].username;
                    let catId = results[0].categoryId;
                    Category.getCategory(catId, function(err, categoryDetails) {
                        if (err || !categoryDetails || categoryDetails.length < 1) {
                            return res.status(500).send('Internal Server Error: Empty category');
                        } else {
                            let catName = categoryDetails[0].categoryName;
                            let catDes = categoryDetails[0].categoryDescription;
                            let city = results[0].city;
                            let shortDes = results[0].shortDescription;
                            let longDes = results[0].longDescription;
                            let dateAdded = results[0].dateAdded;
                            let address = results[0].address;
                            let latitude = results[0].latitude;
                            let longitude = results[0].longitude;

                            Venue.getPhoto(id, function(err, photo) {
                                let photoFilename = "None";
                                let photoDes = "None";
                                let isPrimary = false;
                                if (err) {
                                    return res.status(500).send('Internal Server Error: Photo section is empty');
                                } else {
                                    if (photo.length > 0) {
                                        photoFilename = photo[0].photoFilename;
                                        if (photo[0].photoDescription !== "") {
                                            photoDes = photo[0].photoDescription;
                                        }
                                        if (photo[0].isPrimary === 1) {
                                            isPrimary = true;
                                        }
                                    }
                                    let data = {
                                        "venueName": venueName,
                                        "admin": {
                                            "userId": userId,
                                            "username": username
                                        },
                                        "category": {
                                            "categoryId": catId,
                                            "categoryName": catName,
                                            "categoryDescription": catDes
                                        },
                                        "city": city,
                                        "shortDescription": shortDes,
                                        "longDescription": longDes,
                                        "dateAdded": dateAdded,
                                        "address": address,
                                        "latitude": latitude,
                                        "longitude": longitude,
                                        "photos": [
                                            {
                                                "photoFilename": photoFilename,
                                                "photoDescription": photoDes,
                                                "isPrimary": isPrimary
                                            }
                                        ]
                                    };
                                    return res.status(200).send(data);
                                }
                            });
                        }
                    });

                }
            });
        }
    });
};

exports.update = function (req, res) {

};

exports.getCategory = function (req, res) {
    Venue.getCategories(function(results) {
        return res.status(200).json(results);
    });
};
