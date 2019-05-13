const errors = require('../services/errors');
const tools = require('../services/tools');
const fs = require('mz/fs');
const randtoken = require('rand-token');

const photosDirectory = './storage/photos/';

exports.storePhoto = async function (image, fileExt) {
    const filename = randtoken.generate(32) + fileExt;

    try {
        await fs.writeFile(photosDirectory + filename, image);
        return filename;
    } catch (err) {
        errors.logSqlError(err);
        fs.unlink(photosDirectory + filename)
            .catch(err => console.error(err));
        throw err;
    }
};

exports.retrievePhoto = async function (filename) {
    try {
        if (await fs.exists(photosDirectory + filename)) {
            const image = await fs.readFile(photosDirectory + filename);
            const mimeType = tools.getImageMimetype(filename);
            return { image, mimeType };
        } else {
            return null
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.deletePhoto = async function (filename) {
    try {
        if (await fs.exists(photosDirectory + filename)) {
            await fs.unlink(photosDirectory + filename);
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};
