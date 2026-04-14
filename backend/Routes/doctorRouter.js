const express = require("express");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");
const { doctorList, doctorProfile, updateDoctorprofile, getDoctorById, doctorDashboard } = require("../controllers.js/doctorControllers");
const { protected, requireRole } = require("../middleware/auth")
const doctorRouter = express.Router();

//mount router
doctorRouter.get("/list",
    [
        query("search").optional().isString(),
        query("specialization").optional().isString(),
        query("city").optional().isString(),
        query("category").optional().isString(),
        query("minFees").optional().isInt({ min: 0 }),
        query("maxFees").optional().isInt({ min: 0 }),
        query("sortBy").optional().isIn(["fees", "experience", "name", "createdAt"]),
        query("sortOrder").optional().isIn(["asc", "desc"]),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    doctorList
);

doctorRouter.get("/me", protected, requireRole("doctor"), doctorProfile);


doctorRouter.put("/onboarding/update", protected, requireRole("doctor"),
    [
        body("name").optional().notEmpty(),
        body("specialization").optional().notEmpty(),
        body("qualification").optional().notEmpty(),
        body("category").optional().notEmpty(),
        body("experience").optional().isInt({ min: 0 }),
        body("about").optional().isString(),
        body("fees").optional().isInt({ min: 0 }),
        body("hospitalInfo").optional().isObject(),
        body("availabilityRange.startDate").optional().isISO8601(),
        body("availabilityRange.endDate").optional().isISO8601(),
        body("availabilityRange.excludedWeekdays").optional().isArray(),
        body("dailyTimeRanges").isArray({ min: 1 }),
        body("dailyTimeRanges.*.start").isString(),
        body("dailyTimeRanges.*.end").isString(),
        body("slotDurationMinutes").optional().isInt({ min: 5, max: 180 }),
    ],
    validate,
    updateDoctorprofile
);


//get the doctor deatiail by id
doctorRouter.get("/:doctorId", protected, getDoctorById);


//doctore dashboard
doctorRouter.get("/dashboard", protected, requireRole("doctor"), doctorDashboard)


module.exports = doctorRouter;

