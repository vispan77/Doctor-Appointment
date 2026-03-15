const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//function for generating token
const generatetoken = (id, type) => {
    return jwt.sign(
        { id, type },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

//controllers for doctor register
const doctorRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.badRequest("All field is required");
        }

        const exists = await Doctor.findOne({ email });
        if (exists) {
            return res.badRequest("Doctor already exists");
        };

        const hashedPassword = await bcrypt.hash(password, 12);

        const doctor = await Doctor.create({
            ...req.body,
            password: hashedPassword,
        });

        const token = generatetoken(doctor._id, "doctor");

        res.created(
            {
                token, user: {
                    id: doctor._id,
                    type: "doctor"
                }
            },
            "Doctor registered successfully"
        )

    } catch (error) {
        res.serverError("Registration Failed", [error.message])
    }
};


//controller for doctor login
const doctorLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.badRequest("All field is required");
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor || !doctor.password) {
            return res.unauthorized("Invalid credentials");
        };

        const match = await bcrypt.compare(password, doctor.password);
        if (!match) {
            return res.unauthorized("Invalid credentials");
        }


        const token = generatetoken(doctor._id, "doctor");

        res.ok(
            {
                token, user: {
                    id: doctor._id,
                    type: "doctor"
                }
            },
            "Logged in successfully"
        )
    } catch (error) {
        res.serverError("Login Failed", [error.message])
    }
}





//controllers for patient register
const patientRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.badRequest("All field is required");
        }

        const exists = await Patient.findOne({ email });
        if (exists) {
            return res.badRequest("Patient already exists");
        };

        const hashedPassword = await bcrypt.hash(password, 12);

        // const patient = await Patient.create({
        //     ...req.body,
        //     password: hashedPassword,
        // });

        const patient = await Patient.create({
            name,
            email,
            password: hashedPassword
        });



        const token = generatetoken(patient._id, "patient");

        res.created(
            {
                token, user: {
                    id: patient._id,
                    type: "patient"
                }
            },
            "Patient registered successfully"
        )

    } catch (error) {
        res.serverError("Registration Failed", [error.message])
    }
};


//controller for patient login
const patientLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.badRequest("All field is required");
        }

        const patient = await Patient.findOne({ email });
        if (!patient || !patient.password) {
            return res.unauthorized("Invalid credentials");
        };

        const match = await bcrypt.compare(password, patient.password);
        if (!match) {
            return res.unauthorized("Invalid credentials");
        }


        const token = generatetoken(patient._id, "patient");

        res.ok(
            {
                token, user: {
                    id: patient._id,
                    type: "patient"
                }
            },
            "Logged in successfully"
        )
    } catch (error) {
        res.serverError("Login Failed", [error.message])
    }
}




// //google auth 
// const googleAuth = async(req, res, next) => {
//     const userType = req.query.type || "patient";

//     passport.authenticate("google", {
//         scope: ["profile", "email"],
//         state: userType,
//         prompt: "select_account"
//     })(req, res, next)
// };



// //google callback
// // const googleCallback = async(req, res) => {
// //     passport.authenticate("google", {
// //         session: false,
// //         failureRedirect: "/auth/failure"
// //     });

// //     try {
// //         const {user, type} = req.body;
// //         const token = generatetoken(user._id, type);


// //         //redirect to frontend with token
// //         const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
// //         const redirectUrl = `${frontendUrl}/auth/success?token=${token}&type=${type}&user=${
// //             encodeURIComponent(JSON.stringify({
// //                 id: user._id,
// //                 name: user.name,
// //                 email: user.email,
// //                 profileImage: user.profileImage
// //             }))
// //         }`;

// //         res.redirect(redirectUrl);
// //     } catch (error) {
// //         res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(e.message)}`)
// //     }
// // };

// const googleCallback = (req, res, next) => {
//     passport.authenticate("google", {
//         session: false,
//         failureRedirect: "/auth/failure"
//     }, (err, user, info) => {

//         if (err || !user) {
//             return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
//         }

//         const type = req.query.state || "patient";
//         const token = generatetoken(user._id, type);

//         const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

//         const redirectUrl = `${frontendUrl}/auth/success?token=${token}&type=${type}&user=${
//             encodeURIComponent(JSON.stringify({
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 profileImage: user.profileImage
//             }))
//         }`;

//         res.redirect(redirectUrl);

//     })(req, res, next);
// };


// //google auth failure
// const googleFailure = (req, res) => {
//     res.badRequest("Google Athentication failed")
// }





// GOOGLE AUTH START
const googleAuth = (req, res, next) => {
    const userType = req.query.type || "patient";

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: userType,
        prompt: "select_account"
    })(req, res, next);
};


// GOOGLE CALLBACK
const googleCallback = (req, res, next) => {

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    passport.authenticate(
        "google",
        { session: false },
        (err, user) => {

            if (err || !user) {
                return res.redirect(`${frontendUrl}/auth/error`);
            }

            const type = req.query.state || "patient";
            const token = generatetoken(user._id, type);

            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            };

            const redirectUrl = `${frontendUrl}/auth/success?token=${token}&type=${type}&user=${encodeURIComponent(
                JSON.stringify(userData)
            )}`;

            return res.redirect(redirectUrl);
        }
    )(req, res, next);
};


// GOOGLE FAILURE
const googleFailure = (req, res) => {
    return res.status(400).json({
        success: false,
        message: "Google Authentication failed"
    });
};




module.exports = {
    doctorRegister,
    doctorLogin,
    patientRegister,
    patientLogin,
    googleAuth,
    googleCallback,
    googleFailure
};
