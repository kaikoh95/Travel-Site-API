const Review = require('../models/reviews.models');
const User = require('../models/users.models');
const Category = require('../models/categories.models');
const Venue = require('../models/venues.models');
const VenuePhoto = require('../models/venues.photos.models');
const validator = require('../helpers/validator');

exports.list = function(req, res) {
    let id = parseInt(req.params.venueId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    let finalJson = [];
    Review.getAll(id, function(err, results) {
        if (err || !results || results.length < 1) {
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            let index = 0;
            results.forEach(function(result) {
                let userId = result.userId;
                User.getNameFromId(userId, function(err, nameWithId) {
                    if (err || !nameWithId) {  // no user found
                        return res.status(404).send('Not Found: User does not exist');
                    } else {
                        let jsonResult = {
                            "reviewAuthor": {
                                "userId": result.userId,
                                "username": nameWithId[0].username
                            },
                            "reviewBody": result.reviewBody,
                            "starRating": result.starRating,
                            "costRating": result.costRating,
                            "timePosted": result.timePosted
                        };
                        finalJson[index] = (jsonResult);
                        if (index >= results.length-1) {
                            let jsonAsArray = finalJson.sort(function (itemA, itemB) {
                                return itemB.timePosted - itemA.timePosted;
                            });
                            return res.status(200).json(jsonAsArray);
                        } else {
                            index++;
                        }
                    }
                });
            });
        }
    });
};

exports.create = function(req, res) {
    let venueId = parseInt(req.params.venueId);
    if (!validator.isValidId(venueId)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');

    let token = req.headers['x-authorization'];
    if (token ===  undefined) {
        return res.status(401).send('Unauthorised: Please provide an authentication token');
    } else {
        User.getIdFromToken(token, function (err, id) {
            if (err || !id || id.length < 1) {
                return res.status(401).send('Unauthorised: Incorrect authentication token provided');
            } else { // authenticated
                let userId = id;
                Venue.getVenue(venueId, function(err, venueDetails) {
                    if (err || !venueDetails || venueDetails.length < 1) {
                        return res.status(400).send('Bad Request: Venue not found');
                    } else {
                        if (userId === venueDetails[0].userId) {
                            return res.status(403).send('Forbidden: You cannot review your own site');
                        } else {
                            Review.retrieveSpecific(userId, venueId, function (err, results) {
                                if (results.length > 0) {
                                    return res.status(403).send('Forbidden: You have already reviewed this site');
                                } else {
                                    if (!req.body.hasOwnProperty("reviewBody") || !req.body.hasOwnProperty("starRating") ||
                                        !req.body.hasOwnProperty("costRating")) {
                                        return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                                    }
                                    let currentDate = new Date();
                                    let review_data = {
                                        "reviewBody": req.body.reviewBody,
                                        "starRating": Number(req.body.starRating),
                                        "costRating": Number(req.body.costRating)
                                    };

                                    if (review_data["reviewBody"] === "" ||
                                        review_data["costRating"] === "" || review_data["starRating"] === "" ||
                                        !Number.isInteger(review_data["costRating"]) || !Number.isInteger(review_data["starRating"]) ||
                                        review_data["costRating"] < 0 || review_data["starRating"] > 5 || review_data["starRating"] < 0) {
                                        return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                                    }

                                    let values = [
                                        [
                                            venueId, userId,
                                            review_data["reviewBody"], review_data["starRating"],
                                            review_data["costRating"], currentDate
                                        ]
                                    ];

                                    Review.insert(values, function(err, output){
                                        if (err) {
                                            return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                                        }
                                        res.status(201).send("Created: You have posted a review");
                                    });

                                }
                            });
                        }
                    }
                });

            }
        });
    }
};

exports.getOne = function(req, res) {
    let id = parseInt(req.params.userId);
    if (!validator.isValidId(id)) return res.status(400).send('Bad Request: Wrong ID format (This is not required but ' +
        'it is an edge case to be considered when the ID given cannot be parsed as an integer)');
    let finalJson = [];
    User.getNameFromId(id, function(err, name) {
        if (err || !name) {  // no user found
            return res.status(404).send('Not Found: User does not exist');
        } else {
            let token = req.headers['x-authorization'];
            if (token ===  undefined) {
                return res.status(401).send('Unauthorised: Please provide an authentication token');
            } else {
                User.getIdFromToken(token, function(err, userId) {
                    if (userId !== id) {
                        return res.status(401).send('Unauthorised: Incorrect authentication token provided');
                    } else { // authenticated
                        Review.retrieve(id, function (err, results) {
                            if (err || !results || results.length < 1) {
                                return res.status(404).send('Not Found: No reviews found');
                            } else {
                                let index = 0;
                                results.forEach(function (result) {
                                    let venueId = result.venueId;
                                    Venue.getVenue(venueId, function(err, venueDetails) {
                                        if (err || !venueDetails || venueDetails.length < 1) {
                                            return res.status(500).send('Internal Server Error: Invalid venue');
                                        } else {
                                            let categoryId = venueDetails[0].categoryId;
                                            Category.getCategoryFromId(categoryId, function(err, categoryName) {
                                                if (err || !categoryName || categoryName.length < 1) {
                                                    return res.status(500).send('Internal Server Error: Empty category');
                                                } else {
                                                    VenuePhoto.getPhotoFromId(venueId, function(err, primaryPhoto) {
                                                        if (err || !primaryPhoto || primaryPhoto.length < 1) {
                                                            return res.status(500).send('Internal Server Error: Photo section is empty');
                                                        } else {
                                                            let jsonResult = {
                                                                "reviewAuthor": {
                                                                    "userId": id,
                                                                    "username": name[0].username
                                                                },
                                                                "reviewBody": result.reviewBody,
                                                                "starRating": result.starRating,
                                                                "costRating": result.costRating,
                                                                "timePosted": result.timePosted,
                                                                "venue": {
                                                                    "venueId": venueDetails[0].venueId,
                                                                    "venueName": venueDetails[0].venueName,
                                                                    "categoryName": categoryName[0].categoryName,
                                                                    "city": venueDetails[0].city,
                                                                    "shortDescription": venueDetails[0].shortDescription,
                                                                    "primaryPhoto": primaryPhoto[0].primaryPhoto
                                                                }
                                                            };
                                                            console.log(jsonResult);
                                                            finalJson[index] = (jsonResult);
                                                            if (index >= results.length-1) {
                                                                let jsonAsArray = finalJson.sort(function (itemA, itemB) {
                                                                    return itemB.timePosted - itemA.timePosted;
                                                                });
                                                                return res.status(200).json(jsonAsArray);
                                                            } else {
                                                                index++;
                                                            }
                                                        }
                                                    });
                                                     
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        }
    });
    
};