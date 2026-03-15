const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");


const protected = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) {
            return res.unauthorized("Missing Token");
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = decode;

        if (decode.type === "doctor") {
            req.user = await Doctor.findById(decode.id);
        } else if (decode.type === "patient") {
            req.user = await Patient.findById(decode.id);
        }

        if (!req.user) {
            return res.unauthorized("Invalid User");
        }

        next();

    } catch (error) {
        return res.unauthorized("Invalid or expired token");
    }
};



const requireRole = (role) => {
    return (req, res, next) => {

        if (!req.auth || !req.auth.type) {
            return res.unauthorized("Access denied");
        }

        if (req.auth.type !== role) {
            return res.forbidden("You do not have permission to access this resource");
        }

        next();
    };
};


module.exports = { protected, requireRole };
