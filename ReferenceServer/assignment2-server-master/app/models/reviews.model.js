const db = require('../../config/db');
const errors = require('../services/errors');

exports.retrieveByVenueId = async function (query, venueId) {
    const { searchSQL, values } = buildSearch(query, venueId);

    try {
        const reviews = await db.getPool().query(searchSQL, values);
        return reviews.map(review => ({
            'reviewAuthor': {
                'userId': review.user_id,
                'username': review.username
            },
            'reviewBody': review.review_body,
            'starRating': review.star_rating,
            'costRating': review.cost_rating,
            'timePosted': review.time_posted
        }));
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

function buildSearch(query, venueId) {
    let searchSQL = 'SELECT review_body, star_rating, cost_rating, time_posted, user_id, username\n' +
        'FROM Review JOIN User ON review_author_id = user_id\n' +
        'WHERE reviewed_venue_id = ?\n';
    let values = [venueId];

    // LIMIT and OFFSET
    if (typeof query.count !== 'undefined') {
        searchSQL += 'LIMIT ?\n';
        values.push(parseInt(query.count));
    }
    if (typeof query.startIndex !== 'undefined') {
        if (typeof query.count === 'undefined') {
            searchSQL += 'LIMIT ?\n';
            values.push(1000000000);
        }
        searchSQL += 'OFFSET ?\n';
        values.push(parseInt(query.startIndex));
    }

    // Return prepared SELECT statement with values to use
    return {
        searchSQL: searchSQL,
        values: values
    };
}

exports.post = async function (review, venueId, authorId) {
    const insertSQL = 'INSERT INTO Review (reviewed_venue_id, review_author_id, review_body, star_rating, ' +
        'cost_rating, time_posted) VALUES (?, ?, ?, ?, ?, ?)';

    const reviewData = [
        venueId,
        authorId,
        review.reviewBody,
        review.starRating,
        review.costRating,
        new Date()
    ];
    try {
        await db.getPool().query(insertSQL, reviewData);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.retrieveByUserId = async function (userId) {
    const selectSQL = 'SELECT review_body, star_rating, cost_rating, time_posted, user_id, username,\n' +
        'Venue.venue_id, venue_name, category_name, city, short_description,\n' +
        'photo_filename AS primary_photo\n' +
        'FROM Review ' +
        'JOIN User ON review_author_id = user_id\n' +
        'JOIN Venue ON reviewed_venue_id = Venue.venue_id\n' +
        'JOIN VenueCategory ON Venue.category_id = VenueCategory.category_id\n' +
        'LEFT JOIN VenuePhoto ON VenuePhoto.venue_id = Venue.venue_id AND VenuePhoto.is_primary = 1\n' +
        'WHERE review_author_id = ?\n';

    try {
        const reviews = await db.getPool().query(selectSQL, userId);
        return reviews.map(review => ({
            'reviewAuthor': {
                'userId': review.user_id,
                'username': review.username
            },
            'reviewBody': review.review_body,
            'starRating': review.star_rating,
            'costRating': review.cost_rating,
            'timePosted': review.time_posted,
            'venue': {
                'venueId': review.venue_id,
                'venueName': review.venue_name,
                'categoryName': review.category_name,
                'city': review.city,
                'shortDescription': review.short_description,
                'primaryPhoto': review.primary_photo
            }
        }));
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};
