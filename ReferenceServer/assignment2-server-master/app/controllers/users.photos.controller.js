const Users = require('../models/users.model');
const Photos = require('../models/photos.model');
const tools = require('../services/tools');

exports.getProfilePhoto = async function (req, res) {
    try {
        const filename = await Users.getProfilePhotoFilename(req.params.id);
        if (filename == null) {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else {
            const imageDetails = await Photos.retrievePhoto(filename);
            res.statusMessage = 'OK';
            res.status(200)
                .contentType(imageDetails.mimeType)
                .send(imageDetails.image);
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.setProfilePhoto = async function (req, res) {
    const image = req.body;
    const userId = req.params.id;

    const user = await Users.findById(req.params.id);
    if (!user) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
        return;
    }

    // Check that the authenticated user isn't trying to change anyone else's photo
    if (userId !== req.authenticatedUserId) {
        res.statusMessage = 'Forbidden';
        res.status(403)
            .send();
        return;
    }

    // Find the file extension for this photo
    const fileExt = tools.getImageExtension(req.header('Content-Type'));
    if (fileExt === null) {
        res.statusMessage = 'Bad Request: photo must be either image/jpeg or image/png type';
        res.status(400)
            .send();
        return;
    }

    try {
        const existingPhoto = await Users.getProfilePhotoFilename(userId);
        if (existingPhoto) {
            await Photos.deletePhoto(existingPhoto);
        }

        const filename = await Photos.storePhoto(image, fileExt);
        await Users.setProfilePhotoFilename(userId, filename);
        if (existingPhoto) {
            res.statusMessage = 'OK';
            res.status(200)
                .send();
        } else {
            res.statusMessage = 'Created';
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

exports.deleteProfilePhoto = async function (req, res) {
    const userId = req.params.id;

    const user = await Users.findById(req.params.id);
    if (!user) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
        return;
    }

    // Check that the authenticated user isn't trying to delete anyone else's photo
    if (userId !== req.authenticatedUserId) {
        res.statusMessage = 'Forbidden';
        res.status(403)
            .send();
    } else {
        try {
            const photoFilename = await Users.getProfilePhotoFilename(userId);
            if (photoFilename == null) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();
            } else {
                await Promise.all([
                    Photos.deletePhoto(photoFilename),
                    Users.setProfilePhotoFilename(userId, null)
                ]);
                res.statusMessage = 'OK';
                res.status(200)
                    .send();
            }
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};
