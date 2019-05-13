const Reviews = require('../models/reviews.model');
const Venues = require('../models/venues.model');
const validator = require('../services/validator');
const tools = require('../services/tools');

exports.viewSome = async function (req, res) {
    req.query = tools.unstringifyObject(req.query);
    const validation = validator.checkAgainstSchema(
        'components/schemas/RetrieveReviewsRequest',
        req.query,
        false
    );

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            const reviews = await Reviews.retrieveByVenueId(req.query, req.params.id);
            res.statusMessage = 'OK';
            res.status(200)
                .json(reviews);
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};

exports.postReview = async function (req, res) {
    let validation = validator.checkAgainstSchema(
        'paths/~1venues~1{id}~1reviews/post/requestBody/content/application~1json/schema',
        req.body
    );

    // Extra validation
    const venueId = parseInt(req.params.id);
    if (isNaN(venueId) || venueId < 0) {
        validation = 'id must be an integer greater than 0';
    }

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            const venue = await Venues.viewDetails(venueId);
            const existingReviews = await Reviews.retrieveByVenueId({}, venueId);
            if (tools.equalNumbers(venue.admin.userId, req.authenticatedUserId)) {
                // An admin cannot post a review for their own venue
                res.statusMessage = 'Forbidden: cannot post a review on your own venue';
                res.status(403)
                    .send();
            } else if (existingReviews.find(review => tools.equalNumbers(review.reviewAuthor.userId,
                    req.authenticatedUserId))) {
                // You cannot post more than one review for the same venue
                res.statusMessage = 'Forbidden: cannot post more than one review for the same venue';
                res.status(403)
                    .send();
            } else {
                await Reviews.post(req.body, venueId, req.authenticatedUserId);
                res.statusMessage = 'Created';
                res.status(201)
                    .send();
            }
        } catch (err) {
            if (err.sqlMessage && err.sqlMessage.includes('foreign key constraint fails')) {
                // No venue exists with the given id
                res.statusMessage = 'Bad Request: no venue exists with the given id';
                res.status(400)
                    .send();
            } else {
                if (!err.hasBeenLogged) console.error(err);
                res.statusMessage = 'Internal Server Error';
                res.status(500)
                    .send();
            }
        }
    }
};

exports.viewUserReviews = async function (req, res) {
    try {
        const reviews = await Reviews.retrieveByUserId(req.params.id);
        res.statusMessage = 'OK';
        res.status(200)
            .json(reviews);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};
