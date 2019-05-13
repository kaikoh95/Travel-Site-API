const Ajv = require('ajv');
const ajv = new Ajv({ removeAdditional: 'all' });
const swaggerApi = require('../resources/seng365_travel_site_api_spec.json');

ajv.addSchema(swaggerApi, 'swagger');
ajv.addFormat('password', /.*/);  // TODO potentially setup password strength requirements through this?
ajv.addFormat('binary', /.*/);

exports.checkAgainstSchema = function (schemaPath, data, requireNotEmpty = true) {
    const schemaRef = 'swagger#/' + schemaPath;
    try {
        if (ajv.validate({ $ref: schemaRef }, data)) {
            if (requireNotEmpty && Object.keys(data).length === 0)
                return 'no valid fields provided';
            else {
                return true;
            }
        } else {
            return ajv.errorsText();
        }
    } catch (err) {
        return err.message;
    }
};
