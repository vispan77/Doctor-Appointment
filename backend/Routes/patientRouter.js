const express = require("express");
const patientRouter = express.Router();
const { protected, requireRole } = require("../middleware/auth");
const { patientProfile, updatePatientprofile } = require("../controllers.js/patientControllers");
const { body } = require("express-validator");
const validate = require("../middleware/validate");



patientRouter.get("/me", protected, requireRole("patient"), patientProfile);


patientRouter.put("/onboarding/update", protected, requireRole("patient"),
    [
        body("name").optional().notEmpty(),
        body("phone").optional().isString(),
        body("dob").optional().isISO8601(),
        body("gender").optional().isIn(['male', 'female', 'other']),
        body("bloodGroup").optional().isString(),

        body("emergencyContact").optional().isObject(),
        body("emergencyContact.name").optional().isString().notEmpty(),
        body("emergencyContact.phone").optional().isString().notEmpty(),
        body("emergencyContact.relationship").optional().isString().notEmpty(),

        body("medicalHistory").optional().isObject(),
        body("medicalHistory.allergies").optional().isString().notEmpty(),
        body("medicalHistory.currentMedications").optional().isString().notEmpty(),
        body("medicalHistory.chronicConditions").optional().isString().notEmpty(),
    ],
    validate,
    updatePatientprofile
);


module.exports = patientRouter;