const Patient = require("../models/Patient");
const { computeAgeFromDob } = require("../utils/date");

//controller for getting patient profile by id
const patientProfile = async (req, res) => {
    const patient = await Patient.findById(req.user._id).select("-password -googleId");
    res.ok(patient, "Patient Profile is Feteched")
}



//controller for updating patient profile by id
const updatePatientprofile = async (req, res) => {
    try {
        const update = { ...req.body };

        if (update.dob) {
            update.age = computeAgeFromDob(update.dob)
        }
        
        delete update.password;
        update.isVerified = true;  //mark profile verified on update 

        const patient = await Patient.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password -googleId");

        res.ok(patient, "Patient Profile Updated");

    } catch (error) {
        res.serverError("Patient updated failed", [error.message]);
    }
};

module.exports = {
    patientProfile,
    updatePatientprofile
}