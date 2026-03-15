const {validationResult} = require("express-validator");

const validate = (req, res, next) => {
    const error = validationResult(req);

    if(!error.isEmpty()){
        return res.badRequest("Validation Error", error.array());
    }

    next();
}

module.exports = validate;