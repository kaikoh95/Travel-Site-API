const db = require('../../config/db');
const errors = require('../services/errors');
const tools = require('../services/tools');
const passwords = require('../services/passwords');
const randtoken = require('rand-token');

exports.create = async function (user) {
    const createSQL = 'INSERT INTO User (username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?)';

    const userData = [
        user.username,
        user.email,
        user.givenName,
        user.familyName,
        await passwords.hash(user.password),
    ];
    try {
        const result = await db.getPool().query(createSQL, userData);
        return result.insertId;
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.findByUsernameOrEmail = async function (username, email) {
    const findSQL = 'SELECT user_id, username, given_name, family_name, password, email ' +
        'FROM User WHERE username = ? OR email = ?';

    try {
        const rows = await db.getPool().query(findSQL, [username, email]);
        if (rows.length < 1) {
            return null;
        } else {
            let foundUser = rows[0];
            return {
                'userId': foundUser.user_id,
                'username': foundUser.username,
                'givenName': foundUser.given_name,
                'familyName': foundUser.family_name,
                'password': foundUser.password,
                'email': foundUser.email,
            }
        }
    } catch (err) {
        errors.logSqlError(err);
        return null;
    }
};

exports.login = async function (userId) {
    const loginSQL = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    const token = randtoken.generate(32);

    try {
        await db.getPool().query(loginSQL, [token, userId]);
        return {
            'userId': userId,
            'token': token
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.logout = async function (userId) {
    const logoutSQL = 'UPDATE User SET auth_token = NULL WHERE user_id = ?';

    try {
        await db.getPool().query(logoutSQL, userId);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.findById = async function (id, isCurrentUser = false) {
    const viewSQL = 'SELECT username, given_name, family_name, email FROM User WHERE user_id = ?';

    try {
        const rows = await db.getPool().query(viewSQL, id);
        if (rows.length < 1) {
            return null;
        } else {
            const foundUser = rows[0];
            let userData = {
                'username': foundUser.username,
                'givenName': foundUser.given_name,
                'familyName': foundUser.family_name,
            };
            if (isCurrentUser) {
                userData.email = foundUser.email;
            }
            return userData;
        }
    } catch (err) {
        errors.logSqlError(err);
        return null;
    }
};

exports.modify = async function (userId, modification) {
    const updateSQL = 'UPDATE User SET ? WHERE user_id = ?';

    // Hash the new password if it has been changed
    if (modification.password) {
        modification.password = await passwords.hash(modification.password);
    }

    try {
        await db.getPool().query(updateSQL, [tools.toUnderscoreCase(modification), userId]);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};

exports.getProfilePhotoFilename = async function (userId) {
    const selectSQL = 'SELECT profile_photo_filename FROM User WHERE user_id = ?';

    try {
        const rows = await db.getPool().query(selectSQL, userId);
        if (rows.length) {
            return rows[0].profile_photo_filename;
        }
    } catch (err) {
        errors.logSqlError(err);
    }

    return null;
};

exports.setProfilePhotoFilename = async function (userId, photoFilename) {
    const updateSQL = 'UPDATE User SET profile_photo_filename = ? WHERE user_id = ?';

    try {
        const result = await db.getPool().query(updateSQL, [photoFilename, userId]);
        if (result.changedRows !== 1) {
            throw Error('Should be exactly one user whose profile photo was modified.');
        }
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
};
