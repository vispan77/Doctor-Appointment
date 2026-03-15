const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { doctorRegister, doctorLogin, patientLogin, patientRegister, googleAuth, googleFailure, googleCallback } = require("../controllers.js/auth");
const authRouter = express.Router();





//mount router
authRouter.post("/doctor/register",
    [
        body("name").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],
    validate,
    doctorRegister
);

authRouter.post("/doctor/login",
    [
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],
    validate,
    doctorLogin
);

authRouter.post("/patient/register",
    [
        body("name").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],
    validate,
    patientRegister
);

authRouter.post("/patient/login",
    [
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],
    validate,
    patientLogin
);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
authRouter.get("/failure", googleFailure);



module.exports = authRouter;