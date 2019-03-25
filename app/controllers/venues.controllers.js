const Venue = require('../models/venues.models');
const VenuePhoto = require('../models/venues.photos.models');
const User = require('../models/users.models');
const Category = require('../models/categories.models');
const Review = require('../models/reviews.models');
const validator = require('../helpers/validator');
const haversine = require('haversine')

/**
 * Lists a venues and allows custom results from querying
 * @param req
 * @param res
 * @returns {*|void|boolean}
 */
exports.list = (req, res) => {
    if (req.query.hasOwnProperty("myLatitude")) {
        if (isNaN(Number(req.query.myLatitude)) ||
            Number(req.query.myLatitude) > 90.0 || Number(req.query.myLatitude < -90.0)) {
            return res.status(400).send('Bad Request: Query cannot be processed now');
        }
    }
    if (req.query.hasOwnProperty("myLongitude")) {
        if (isNaN(Number(req.query.myLongitude)) ||
            Number(req.query.myLongitude) > 180.0 || Number(req.query.myLongitude < -180.0)) {
            return res.status(400).send('Bad Request: Query cannot be processed now');
        }
    }
    Venue.getAll(function(err, allVenues) {
        if (err || !allVenues || allVenues.length < 1) {  // no venue found
            return res.status(400).send('Bad Request: Query cannot be processed now');
        } else {
            let venuesArray = [];
            let mainCount = 0;
            allVenues.forEach(function (venue) {
                let venueId = venue.venueId;
                let adminId = venue.adminId;
                let venueName = venue.venueName;
                let categoryId = venue.categoryId;
                let city = venue.city;
                let shortDescription = venue.shortDescription;
                let venueLatitude = venue.latitude;
                let venueLongitude = venue.longitude;

                Review.getAll(venueId, function(err, allReviews) {
                    let meanStarRating = 0;
                    let modeCostRating = 0;
                    let reviewNull = false;
                    if (err) {
                        return res.status(400).send('Bad Request: Query cannot be processed now');
                    } else {
                        if (!allReviews || allReviews.length < 1) {
                            reviewNull = true;
                        }
                        let starCount = 0;
                        let costCount = {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0};
                        let costKeyArray = Object.keys(costCount);
                        allReviews.forEach(function (review) {
                            meanStarRating += review.starRating;
                            starCount++;
                            let costRating = review.costRating;
                            if (Number(costKeyArray[0]) === costRating) {
                                costCount[costRating.toString()] += 1
                            } else if (Number(costKeyArray[1]) === costRating) {
                                costCount[costRating.toString()] += 1
                            } else if (Number(costKeyArray[2]) === costRating) {
                                costCount[costRating.toString()] += 1
                            } else if (Number(costKeyArray[3]) === costRating) {
                                costCount[costRating.toString()] += 1
                            } else if (Number(costKeyArray[4]) === costRating) {
                                costCount[costRating.toString()] += 1
                            }
                            if (starCount > allReviews.length-1) {
                                meanStarRating = Number(meanStarRating / starCount);
                                starCount = 0
                            }
                        });
                        costKeyArray.forEach(function(count) {
                            if (costCount[count] >= costCount[modeCostRating]) {
                                modeCostRating = Number(count);
                            }
                        });
                        meanStarRating = Math.round(meanStarRating * 1000) / 1000;
                        VenuePhoto.getPhotoFromId(venueId, function(err, primaryPhoto) {
                            let primaryNull = false;
                            let photo = "";
                            if (err) {
                                return res.status(400).send('Bad Request: Query cannot be processed now');
                            } else {
                                if (!primaryPhoto || primaryPhoto.length < 1) {
                                    primaryNull = true;
                                } else {
                                    photo = primaryPhoto[0].primaryPhoto;
                                }
                                let userVenueDistance = 0;
                                if (req.query.hasOwnProperty("myLatitude") && req.query.hasOwnProperty("myLongitude")) {
                                    let userPosition = {
                                        latitude: Number(req.query.myLatitude),
                                        longitude: Number(req.query.myLongitude)
                                    };

                                    let venuePosition = {
                                        latitude: Number(venueLatitude),
                                        longitude: Number(venueLongitude)
                                    };
                                    userVenueDistance = Math.round(haversine(userPosition, venuePosition, {unit: 'km'}) * 1000 ) / 1000;
                                }
                                let data = {};
                                if (reviewNull === true) {
                                    if (primaryNull === true) {
                                        data = {
                                            "adminId": adminId,
                                            "venueId": venueId,
                                            "venueName": venueName,
                                            "categoryId": categoryId,
                                            "city": city,
                                            "shortDescription": shortDescription,
                                            "latitude": venueLatitude,
                                            "longitude": venueLongitude,
                                            "meanStarRating": null,
                                            "modeCostRating": null,
                                            "primaryPhoto": null,
                                            "distance": userVenueDistance
                                        };
                                    } else {
                                        data = {
                                            "adminId": adminId,
                                            "venueId": venueId,
                                            "venueName": venueName,
                                            "categoryId": categoryId,
                                            "city": city,
                                            "shortDescription": shortDescription,
                                            "latitude": venueLatitude,
                                            "longitude": venueLongitude,
                                            "meanStarRating": null,
                                            "modeCostRating": null,
                                            "primaryPhoto": photo,
                                            "distance": userVenueDistance
                                        };
                                    }
                                } else {
                                    if (primaryNull === true) {
                                        data = {
                                            "adminId": adminId,
                                            "venueId": venueId,
                                            "venueName": venueName,
                                            "categoryId": categoryId,
                                            "city": city,
                                            "shortDescription": shortDescription,
                                            "latitude": venueLatitude,
                                            "longitude": venueLongitude,
                                            "meanStarRating": meanStarRating,
                                            "modeCostRating": modeCostRating,
                                            "primaryPhoto": null,
                                            "distance": userVenueDistance
                                        };
                                    } else {
                                        data = {
                                            "adminId": adminId,
                                            "venueId": venueId,
                                            "venueName": venueName,
                                            "categoryId": categoryId,
                                            "city": city,
                                            "shortDescription": shortDescription,
                                            "latitude": venueLatitude,
                                            "longitude": venueLongitude,
                                            "meanStarRating": meanStarRating,
                                            "modeCostRating": modeCostRating,
                                            "primaryPhoto": photo,
                                            "distance": userVenueDistance
                                        };
                                    }
                                }
                                if (!req.query.hasOwnProperty("myLatitude") || !req.query.hasOwnProperty("myLongitude")) {
                                    delete data.distance;
                                }

                                venuesArray.push(data);
                                mainCount++;

                                //filter by query
                                if (mainCount >= allVenues.length) {
                                    let queryCity = "";
                                    let queryQ = "";
                                    let querySort = "STAR_RATING";
                                    let queryReverse = "false";
                                    let queryCat = -1;
                                    let queryStar = -1;
                                    let queryCost = -1;
                                    let queryAdmin = -1;
                                    let queryIndex = -1;
                                    let queryCount = -1;

                                    if (req.query.hasOwnProperty("startIndex")) {
                                        if (req.query.startIndex.length > 0 && Number.isInteger(Number(req.query.startIndex))) {
                                            queryIndex = Number(req.query.startIndex);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (req.query.hasOwnProperty("count")) {
                                        if (req.query.count.length > 0 && Number.isInteger(Number(req.query.count))) {
                                            queryCount = Number(req.query.count);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }

                                    if (req.query.hasOwnProperty("categoryId")) {
                                        if (req.query.categoryId.length > 0 && Number.isInteger(Number(req.query.categoryId))) {
                                            queryCat = Number(req.query.categoryId);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (req.query.hasOwnProperty("minStarRating")) {
                                        if (req.query.minStarRating.length > 0 && Number.isInteger(Number(req.query.minStarRating))) {
                                            queryStar = Number(req.query.minStarRating);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (req.query.hasOwnProperty("maxCostRating")) {
                                        if (req.query.maxCostRating.length > 0 && Number.isInteger(Number(req.query.maxCostRating))) {
                                            queryCost = Number(req.query.maxCostRating);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (req.query.hasOwnProperty("adminId")) {
                                        if (req.query.adminId.length > 0 && Number.isInteger(Number(req.query.adminId))) {
                                            queryAdmin = Number(req.query.adminId);
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }

                                    if (req.query.hasOwnProperty("city")) {
                                        if (req.query.city.length > 0) {
                                            queryCity = req.query.city;
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (req.query.hasOwnProperty("q")) {
                                        if (req.query.q.length > 0) {
                                            queryQ = req.query.q;
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }

                                    // get queries for filter
                                    if (queryCat > 0) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.categoryId === queryCat;
                                        });
                                    } 
                                    
                                    if (queryAdmin > 0) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.adminId === queryAdmin;
                                        });
                                    }
                                    if (queryStar > 0 && queryStar < 6) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.meanStarRating >= queryStar;
                                        });
                                    } else {
                                        return res.status(400).send('Bad Request: Query cannot be processed now');
                                    }
                                    if (queryCost >= 0 && queryCost < 5) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.modeCostRating <= queryCost;
                                        });
                                    } else {
                                        return res.status(400).send('Bad Request: Query cannot be processed now');
                                    }
                                    if (queryCity.length > 0) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.city.toLowerCase() === queryCity.toLowerCase();
                                        });
                                    }
                                    if (queryQ.length > 0) {
                                        venuesArray = venuesArray.filter(item => {
                                            return item.venueName.toLowerCase().includes(queryQ.toLowerCase());
                                        });
                                    }

                                    //sort by query
                                    if (req.query.hasOwnProperty("sortBy")) {
                                        if (req.query.sortBy.length > 0) {
                                            querySort = req.query.sortBy;
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (querySort.toUpperCase() !== "STAR_RATING" && 
                                        querySort.toUpperCase() !== "COST_RATING" && 
                                        querySort.toUpperCase() !== "DISTANCE") {
                                        return res.status(400).send('Bad Request: Query cannot be processed now');
                                    }
                                    if (querySort.toUpperCase() === "DISTANCE" &&
                                        (!req.query.hasOwnProperty("myLatitude") || !req.query.hasOwnProperty("myLongitude"))) {
                                        return res.status(400).send('Bad Request: Query cannot be processed now');
                                    }
                                    if (querySort.toUpperCase() === "STAR_RATING") {
                                        venuesArray = venuesArray.sort(function (itemA, itemB) {
                                            return itemB.meanStarRating - itemA.meanStarRating;
                                        });
                                    }
                                    if (querySort.toUpperCase() === "COST_RATING") {
                                        venuesArray = venuesArray.sort(function (itemA, itemB) {
                                            return itemB.modeCostRating - itemA.modeCostRating;
                                        });
                                    }
                                    if (querySort.toUpperCase() === "DISTANCE") {
                                        venuesArray = venuesArray.sort(function (itemA, itemB) {
                                            return itemA.distance - itemB.distance;
                                        });
                                    }

                                    // to reverse sort?
                                    if (req.query.hasOwnProperty("reverseSort")) {
                                        if (req.query.reverseSort.length > 0) {
                                            queryReverse = req.query.reverseSort;
                                        } else {
                                            return res.status(400).send('Bad Request: Query cannot be processed now');
                                        }
                                    }
                                    if (queryReverse.toLowerCase() !== "true" && queryReverse.toLowerCase() !== "false") {
                                        return res.status(400).send('Bad Request: Query cannot be processed now');
                                    }
                                    if (queryReverse.toLowerCase() === "true") {
                                        venuesArray.reverse();
                                    }

                                    // paginated
                                    if (queryIndex > 0) {
                                        let length = venuesArray.length;
                                        venuesArray = venuesArray.slice(queryIndex, length);
                                    }
                                    if (queryCount > 0) {
                                        let arrayLength = venuesArray.length
                                        while (arrayLength > queryCount) {
                                            venuesArray.pop();
                                            arrayLength = venuesArray.length
                                        }
                                    }
                                    return res.status(200).json(venuesArray)

                                }          
                            }
                        });
                    }
                });
            });
        }
    });
};

/**
 * Adds a new venue
 * @param req
 * @param res
 * @returns {*|void|boolean}
 */
exports.create = (req, res) => {
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
                    data["latitude"] > 90.0 || data["latitude"] < -90.0 || data["longitude"] < -180.0 || data["longitude"] > 180.0) {
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

/**
 * Retrieves detailed info of a venu
 * @param req
 * @param res
 * @returns {*|void|boolean}
 */
exports.getOne = (req, res) => {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function(err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            let venueId = id;
            let venueName = results[0].venueName;
            let userId = results[0].userId;
            User.getNameFromId(userId, function(err, name) {
                if (err || !name || name.length < 1) {  // no user found
                    return res.status(500).send('Internal Server Error: No user found');
                } else {
                    let username = name[0].username;
                    let catId = results[0].categoryId;
                    Category.getCategories(catId, function(err, categoryDetails) {
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

                            VenuePhoto.getPhoto(venueId, function(err, photo) {
                                let photosArray = [];
                                if (err || !photo || photo.length < 1) {
                                    photosArray = [];
                                } else {
                                    photo.forEach(function (result) {
                                        let isPrimary = false;
                                        if (result.isPrimary === 1) {
                                            isPrimary = true;
                                        }
                                        let photoData = {
                                            "photoFilename": String(result.photoFilename),
                                            "photoDescription": result.photoDescription,
                                            "isPrimary": isPrimary
                                        };
                                        photosArray.push(photoData);
                                    });

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
                                    "photos": photosArray
                                };
                                res.setHeader("Content-type", "application/json");
                                return res.status(200).json(data);

                            });
                        }
                    });

                }
            });
        }
    });
};

/**
 * Updates the venue
 * @param req
 * @param res
 * @returns {*|void|boolean}
 */
exports.update = (req, res) => {
    let id = Number(req.params.venueId);
    if (!validator.isValidId(id) || isNaN(id) || !Number.isInteger(id)) {
        return res.status(404).send('Not Found: Invalid venue ID');
    }
    Venue.getVenue(id, function(err, results) {
        if (err || !results || results.length < 1) {  // no venue found
            return res.status(404).send('Not Found: Venue does not exist');
        } else {
            let adminId = results[0].userId;
            let venueName = results[0].venueName;
            let catId = results[0].categoryId;
            let shortDes = results[0].shortDescription;
            let longDes = results[0].longDescription;
            let address = results[0].address;
            let city = results[0].city;
            let longitude = results[0].longitude;
            let latitude = results[0].latitude;

            let token = req.headers['x-authorization'];
            if (token ===  undefined) {
                return res.status(401).send('Unauthorised: Please provide an authentication token');
            } else {
                User.getIdFromToken(token, function (err, userId) {
                    if (err || !userId || userId.length < 1) {
                        return res.status(401).send('Unauthorised: Incorrect authentication token provided');
                    } else { // authenticated
                        if (userId!== adminId) {
                            return res.status(403).send('Forbidden: You are not the admin of the site');
                        } else {
                            if (req.body.length < 1 || !req.body || req.body === {} || req.body === undefined ||
                                req.body === null || req.body.constructor === Object && Object.keys(req.body).length === 0) {
                                return res.status(400).send('Bad Request: One or more required field is missing/incorrect');
                            } else {
                                if (req.body.hasOwnProperty("venueName") && req.body.venueName !== "") {
                                    venueName = req.body.venueName;
                                }
                                if (req.body.hasOwnProperty("categoryId") && req.body.categoryId !== "") {
                                    if (!Number.isInteger(req.body.categoryId)) {
                                        return res.status(400).send('Bad Request: Incorrect input');
                                    } else  {
                                        catId = Number(req.body.categoryId);
                                    }
                                }
                                if (req.body.hasOwnProperty("city") && req.body.city !== "") {
                                    city = req.body.city;
                                }
                                if (req.body.hasOwnProperty("shortDescription") && req.body.shortDescription !== "") {
                                    shortDes = req.body.shortDescription;
                                }
                                if (req.body.hasOwnProperty("longDescription") && req.body.longDescription !== "") {
                                    longDes = req.body.longDescription;
                                }
                                if (req.body.hasOwnProperty("address") && req.body.address !== "") {
                                    address = req.body.address;
                                }
                                if (req.body.hasOwnProperty("latitude") && req.body.latitude !== "") {
                                    if (isNaN(req.body.latitude)) {
                                        return res.status(400).send('Bad Request: Incorrect input');
                                    } else {
                                        latitude = Number(req.body.latitude);
                                        if (latitude > 90.0 || latitude < -90.0) {
                                            return res.status(400).send('Bad Request: Incorrect input');
                                        }
                                    }
                                }
                                if (req.body.hasOwnProperty("longitude") && req.body.longitude !== "") {
                                    if (isNaN(req.body.longitude)) {
                                        return res.status(400).send('Bad Request: Incorrect input');
                                    } else {
                                        longitude = Number(req.body.longitude);
                                        if (longitude < -180.0 || longitude > 180.0) {
                                            return res.status(400).send('Bad Request: Incorrect input');
                                        }
                                    }
                                }

                                let values = [venueName, catId, city, shortDes, longDes, address, latitude, longitude, id];
                                Venue.updateVenue(values, function(err) {
                                    if (err) {
                                        return res.status(400).send("Bad Request: Unable to process request");
                                    }
                                    return res.status(200).send("OK: Details successfully updated");
                                });
                            }
                        }
                    }
                });
            }

        }
    });

};

/**
 * Gets all categories available
 * @param req
 * @param res
 */
exports.getCategory = (req, res) => {
    Category.getAllCategories(function(results) {
        return res.status(200).json(results);
    });
};
