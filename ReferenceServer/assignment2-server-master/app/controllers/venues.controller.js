const Venues = require('../models/venues.model');
const validator = require('../services/validator');
const tools = require('../services/tools');

exports.search = async function (req, res) {
    req.query = tools.unstringifyObject(req.query);
    let validation = validator.checkAgainstSchema(
        'components/schemas/VenueSearchRequest',
        req.query,
        false
    );

    const includeDistance = !!(req.query.myLatitude && req.query.myLongitude);

    // Extra validation (myLatitude and myLongitude must be provided if sorting by distance)
    if (validation === true && req.query.sortBy === 'DISTANCE' && !includeDistance) {
        validation = 'myLatitude and myLongitude must be provided when sorting by distance';
    }

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            const venues = await Venues.search(req.query, includeDistance);
            res.statusMessage = 'OK';
            res.status(200)
                .json(venues);
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};

exports.viewDetails = async function (req, res) {
    try {
        const venue = await Venues.viewDetails(req.params.id);
        if (venue) {
            res.statusMessage = 'OK';
            res.status(200)
                .json(venue);
        } else {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.create = async function (req, res) {
    let validation = validator.checkAgainstSchema(
        'paths/~1venues/post/requestBody/content/application~1json/schema',
        req.body
    );

    if (validation === true) {
        const categories = await Venues.retrieveCategories();
        if (!categories.find(category => category.categoryId === req.body.categoryId)) {
            validation = 'categoryId does not match any existing category';
        }
    }

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            const venueId = await Venues.create(req.body, req.authenticatedUserId);
            res.statusMessage = 'Created';
            res.status(201)
                .json({ venueId });
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};

exports.modify = async function (req, res) {
    const validation = validator.checkAgainstSchema(
        'paths/~1venues~1{id}/patch/requestBody/content/application~1json/schema',
        req.body);

    const venue = await Venues.viewDetails(req.params.id);
    if (venue === null) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    } else if (!tools.equalNumbers(venue.admin.userId, req.authenticatedUserId)) {
        res.statusMessage = 'Forbidden';
        res.status(403)
            .send();
    } else if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            await Venues.modify(req.body, req.params.id);
            res.statusMessage = 'OK';
            res.status(200)
                .send();
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};

exports.getCategories = async function (req, res) {
    try {
        const categories = await Venues.retrieveCategories();
        res.statusMessage = 'OK';
        res.status(200)
            .json(categories);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};
