const Venues = require('../models/venues.model');
const Photos = require('../models/photos.model');
const tools = require('../services/tools');
const validator = require('../services/validator');

exports.addVenuePhoto = async function (req, res) {
    const venueId = req.params.id;
    const image = req.file;
    const photoDetails = tools.unstringifyObject(req.body);

    try {
        const venue = await Venues.viewDetails(venueId);
        const validation = validator.checkAgainstSchema(
            'paths/~1venues~1{id}~1photos/post/requestBody/content/multipart~1form-data/schema',
            photoDetails
        );

        if (!venue) {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else if (!tools.equalNumbers(venue.admin.userId, req.authenticatedUserId)) {
            // Check that the authenticated user is an admin for the venue
            res.statusMessage = 'Forbidden';
            res.status(403)
                .send();
        } else if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation}`;
            res.status(400)
                .send();
        } else {
            const fileExt = tools.getImageExtension(image.mimetype);
            const photoFilename = await Photos.storePhoto(image.buffer, fileExt);

            // Clear 'is_primary' status on any other photos if this one is the new primary photo
            if (photoDetails.makePrimary) {
                await Venues.clearPrimaryStatus(venueId);
            }

            // If there is no other primary photo already, this one MUST become primary
            if (!venue.photos.find(photo => photo.isPrimary)) {
                photoDetails.makePrimary = true;
            }

            await Venues.addVenuePhotoLink(venueId, photoFilename, photoDetails);

            res.statusMessage = 'OK';
            res.status(201)
                .send();
        }

    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.getVenuePhoto = async function (req, res) {
    const venueId = req.params.id;
    const photoFilename = req.params.photoFilename;

    try {
        const venuePhotoLinks = await Venues.getVenuePhotoLinks(venueId);
        if (venuePhotoLinks.find(link => link.photoFilename === photoFilename)) {
            const imageDetails = await Photos.retrievePhoto(photoFilename);
            res.statusMessage = 'OK';
            res.status(200)
                .contentType(imageDetails.mimeType)
                .send(imageDetails.image);
        } else {
            // Either no venue with that id exists or that photo doesn't belong to it/exist
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

exports.deleteVenuePhoto = async function (req, res) {
    const venueId = req.params.id;
    const photoFilename = req.params.photoFilename;

    try {
        const venue = await Venues.viewDetails(venueId);
        const photoDetails = venue.photos.find(photo => photo.photoFilename === photoFilename);
        if (!venue || !photoDetails) {
            // Check that both the venue exists and that the photo requested belongs to it
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else if (!tools.equalNumbers(venue.admin.userId, req.authenticatedUserId)) {
            // Check that the authenticated user is an admin for the venue
            res.statusMessage = 'Forbidden';
            res.status(403)
                .send();
        } else {
            if (photoDetails.isPrimary) {
                // Randomly select a new primary photo as this one is being deleted
                const nextPrimary = venue.photos.find(photo => photo.photoFilename !== photoFilename);
                if (nextPrimary) {
                    await Venues.makePrimaryPhoto(venueId, nextPrimary.photoFilename);
                }
            }

            await Promise.all([
                Photos.deletePhoto(photoFilename),
                Venues.deleteVenuePhotoLink(venueId, photoFilename)
            ]);

            res.statusMessage = 'OK';
            res.status(200)
                .send();
        }
    } catch (err) {
        if (err.message.includes('exactly one')) {
            // There wasn't a photo to delete
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};

exports.setPrimaryVenuePhoto = async function (req, res) {
    const venueId = req.params.id;
    const photoFilename = req.params.photoFilename;

    try {
        const venue = await Venues.viewDetails(venueId);
        const photoDetails = venue.photos.find(photo => photo.photoFilename === photoFilename);
        if (!venue || !photoDetails) {
            // Check that both the venue exists and that the photo requested belongs to it
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else if (!tools.equalNumbers(venue.admin.userId, req.authenticatedUserId)) {
            // Check that the authenticated user is an admin for the venue
            res.statusMessage = 'Forbidden';
            res.status(403)
                .send();
        } else {
            await Venues.clearPrimaryStatus(venueId);
            await Venues.makePrimaryPhoto(venueId, photoDetails.photoFilename);

            res.statusMessage = 'OK';
            res.status(200)
                .send();
        }
    } catch (err) {
        if (err.message.includes('exactly one')) {
            // There wasn't a photo to set primary
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};
