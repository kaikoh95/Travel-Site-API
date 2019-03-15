"use strict";

/**
 * Validation functions for checking parameters and schemas
 * using ZSchema and swagger-parameters
 */

/**
 * Validates ID parameters
 * No assumptions on type provided, but check that is valid integer
 *
 * @param id - of any Type
 * @returns {boolean}
 */
exports.isValidId = id => {
    let getId = parseInt(id);
    return Number.isInteger(getId) && (getId > 0) // assume start index at 1 (for MySQL)
};