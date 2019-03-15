const crypto = require('crypto');

/**
 * Function to convert user passwords into hash before storing in database
 * @param password - user password as String
 * @returns {string} - hashed password as String
 */
exports.getHash = function(password){
    return crypto.pbkdf2Sync(password, "salt", 100000, 32, 'sha256').toString('hex');
};