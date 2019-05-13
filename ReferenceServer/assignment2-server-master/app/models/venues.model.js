const db = require('../../config/db');
const errors = require('../services/errors');
const tools = require('../services/tools');
const distance = require('@turf/distance').default;

exports.search = async function (query, includeDistance = false) {
    const { searchSQL, values } = buildSearchSQL(query);

    try {
        let venues = await db.getPool().query(searchSQL, values);
        venues = venues.map(venue => tools.toCamelCase(venue));

        if (includeDistance) {
            const userLoc = [query.myLatitude, query.myLongitude];
            venues.forEach(venue => venue.distance = distance(
                userLoc,
                [venue.latitude, venue.longitude],
                { units: 'kilometers' }
            ));
        }

        if (query.sortBy === 'DISTANCE') {
            venues.sort((v1, v2) => v1.distance - v2.distance);  // sort in ASCENDING order
            if (query.reverseSort) {
                venues.reverse();
            }
        } else if (query.sortBy === 'STAR_RATING' || !query.sortBy) {
            venues.sort((v1, v2) => {
                const star1 = v1.meanStarRating === null ? 3 : v1.meanStarRating;
                const star2 = v2.meanStarRating === null ? 3 : v2.meanStarRating;
                return star2 - star1;
            });
            if (query.reverseSort) {
                venues.reverse();
            }
        }

        return venues;
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

function buildSearchSQL(query) {
    let searchSQL = 'SELECT V.venue_id, venue_name, category_id, city, short_description, latitude, longitude,\n' +
        'AVG(star_rating) AS mean_star_rating,\n' +
        'mode_cost_rating,\n' +
        'photo_filename AS primary_photo\n' +
        'FROM Venue V\n' +
        'LEFT JOIN Review ON reviewed_venue_id = V.venue_id\n' +
        'LEFT JOIN ModeCostRating MCR on MCR.venue_id = V.venue_id\n' +
        'LEFT JOIN VenuePhoto ON VenuePhoto.venue_id = V.venue_id AND VenuePhoto.is_primary = 1\n';
    let values = [];

    // WHERE conditions
    let conditions = [];
    if (query.city) {
        conditions.push('city = ?');
        values.push(query.city);
    }
    if (query.q) {
        conditions.push('venue_name LIKE ?');
        values.push(`%${query.q}%`);
    }
    if (query.categoryId) {
        conditions.push('category_id = ?');
        values.push(query.categoryId);
    }
    if (typeof query.maxCostRating !== 'undefined') {
        conditions.push('mode_cost_rating <= ?');
        values.push(query.maxCostRating);
    }
    if (query.adminId) {
        conditions.push('admin_id = ?');
        values.push(query.adminId);
    }
    if (conditions.length) {
        searchSQL += `WHERE ${(conditions ? conditions.join(' AND ') : 1)}\n`;
    }

    // GROUP BY and HAVING condition
    searchSQL += 'GROUP BY venue_id\n';
    if (query.minStarRating) {
        searchSQL += 'HAVING mean_star_rating >= ?\n';
        values.push(query.minStarRating);
    }

    // ORDER BY
    switch (query.sortBy) {
        case 'COST_RATING':
            searchSQL += `ORDER BY mode_cost_rating ${query.reverseSort ? 'DESC' : 'ASC'}\n`;
            break;
        case 'DISTANCE':
            // TODO handle distance sorting at DB-level instead of server-level
        case 'STAR_RATING':
        default:
            searchSQL += `ORDER BY mean_star_rating ${query.reverseSort ? 'ASC' : 'DESC'}\n`;
            break;
    }

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

exports.viewDetails = async function (venueId) {
    const selectSQL = 'SELECT venue_name, city, short_description, long_description, date_added, ' +
        'address, latitude, longitude, user_id, username, Venue.category_id, category_name, category_description ' +
        'FROM Venue ' +
        'JOIN User ON admin_id = user_id ' +
        'JOIN VenueCategory ON Venue.category_id = VenueCategory.category_id ' +
        'WHERE venue_id = ?';

    try {
        const venue = (await db.getPool().query(selectSQL, venueId))[0];
        if (venue) {
            const photoLinks = await exports.getVenuePhotoLinks(venueId);
            return {
                'venueName': venue.venue_name,
                'admin': {
                    'userId': venue.user_id,
                    'username': venue.username
                },
                'category': {
                    'categoryId': venue.category_id,
                    'categoryName': venue.category_name,
                    'categoryDescription': venue.category_description
                },
                'city': venue.city,
                'shortDescription': venue.short_description,
                'longDescription': venue.long_description,
                'dateAdded': venue.date_added,
                'address': venue.address,
                'latitude': venue.latitude,
                'longitude': venue.longitude,
                'photos': photoLinks
            };
        } else {
            return null;
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.create = async function (venue, userId) {
    const insertSQL = 'INSERT INTO Venue (admin_id, category_id, venue_name, city, short_description, ' +
        'long_description, date_added, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const venueData = [
        userId,
        venue.categoryId,
        venue.venueName,
        venue.city,
        venue.shortDescription,
        venue.longDescription,
        new Date(),
        venue.address,
        venue.latitude,
        venue.longitude
    ];
    try {
        const result = await db.getPool().query(insertSQL, venueData);
        return result.insertId;
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.modify = async function (modifications, venueId) {
    const updateSQL = 'UPDATE Venue SET ? WHERE venue_id = ?';

    try {
        await db.getPool().query(updateSQL, [tools.toUnderscoreCase(modifications), venueId]);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.getVenuePhotoLinks = async function (venueId) {
    const selectSQL = 'SELECT photo_filename, photo_description, is_primary FROM VenuePhoto WHERE venue_id = ?';

    try {
        const photoLinks = await db.getPool().query(selectSQL, venueId);
        return photoLinks.map(photoLink => ({
            photoFilename: photoLink.photo_filename,
            photoDescription: photoLink.photo_description,
            isPrimary: Boolean(photoLink.is_primary)
        }));
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.addVenuePhotoLink = async function (venueId, photoFilename, photoDetails) {
    const insertSQL = 'INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary)\n' +
        'VALUES (?, ?, ?, ?)';

    try {
        await db.getPool().query(insertSQL, 
            [venueId, photoFilename, photoDetails.description, photoDetails.makePrimary]);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.deleteVenuePhotoLink = async function (venueId, photoFilename) {
    const deleteSQL = 'DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?';

    try {
        const result = await db.getPool().query(deleteSQL, [venueId, photoFilename]);
        if (result.affectedRows !== 1) {
            throw Error('Should be exactly one photo link deleted.');
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.makePrimaryPhoto = async function (venueId, photoFilename) {
    const makePrimarySQL = 'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?';

    try {
        await db.getPool().query(makePrimarySQL, [venueId, photoFilename]);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.clearPrimaryStatus = async function (venueId) {
    const clearPrimarySQL = 'UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ?';

    try {
        await db.getPool().query(clearPrimarySQL, venueId);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.retrieveCategories = async function () {
    const selectSQL = 'SELECT category_id, category_name, category_description FROM VenueCategory';

    try {
        const categories = await db.getPool().query(selectSQL);
        return categories.map(category => tools.toCamelCase(category));
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};
