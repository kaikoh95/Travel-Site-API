const Users = require('../models/users.model');
const validator = require('../services/validator');
const passwords = require('../services/passwords');
const tools = require('../services/tools');

function isValidEmail(email) {
    return email.includes('@')
}

exports.create = async function (req, res) {
    let validation = validator.checkAgainstSchema(
        'paths/~1users/post/requestBody/content/application~1json/schema',
        req.body
    );

    // Extra validation for email address
    if (validation === true && !isValidEmail(req.body.email)) {
        validation = 'data.email must be a valid email address';
    }

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            const userId = await Users.create(req.body);
            res.statusMessage = 'Created';
            res.status(201)
                .json({ userId });
        } catch (err) {
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')) {
                // Either username or email was already in use
                res.statusMessage = 'Bad Request: username or email already in use';
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

exports.login = async function (req, res) {
    try {
        const foundUser = await Users.findByUsernameOrEmail(req.body.username, req.body.email);
        if (foundUser != null) {
            const passwordCorrect = await passwords.compare(req.body.password, foundUser.password);
            if (passwordCorrect) {
                const loginResult = await Users.login(foundUser.userId);
                res.statusMessage = 'OK';
                res.status(200)
                    .json(loginResult);
            }
        }

        // Either no user found or password check failed
        res.statusMessage = 'Bad Request: invalid username/email/password supplied';
        res.status(400)
            .send();

    } catch (err) {
        // Something went wrong with either password hashing or logging in
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.logout = async function (req, res) {
    const id = req.authenticatedUserId;

    try {
        await Users.logout(id);
        res.statusMessage = 'OK';
        res.status(200)
            .send();
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.view = async function (req, res) {
    const id = req.params.id;
    const isCurrentUser = id === req.authenticatedUserId;

    const userData = await Users.findById(id, isCurrentUser);
    if (userData == null) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    } else {
        res.statusMessage = 'OK';
        res.status(200)
            .json(userData);
    }
};

exports.change = async function (req, res) {
    // Check request body is valid
    let validation = validator.checkAgainstSchema(
        'paths/~1users~1{id}/patch/requestBody/content/application~1json/schema',
        req.body);

    // Extra validation
    const userId = req.params.id;
    if (isNaN(parseInt(userId)) || parseInt(userId) < 0) {
        validation = 'id must be an integer greater than 0';
    }

    const userExists = (await Users.findById(req.params.id)) !== null;
    if (!userExists) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    } else if (!tools.equalNumbers(userId, req.authenticatedUserId)) {
        // Check that the authenticated user isn't trying to change anyone else's details
        res.statusMessage = 'Forbidden';
        res.status(403)
            .send();
    } else if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation}`;
        res.status(400)
            .send();
    } else {
        try {
            await Users.modify(userId, req.body);
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
