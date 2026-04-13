const Doctor = require("../models/Doctor");

const doctorList = async (req, res) => {
    try {
        const {
            search, specialization, city, category, minFees, maxFees, sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 20

        } = req.query;

        const filter = { isVerified: true };

        if (specialization) {
            filter.specialization = {
                $regex: `^${specialization}$`,
                $options: "i",
            };
        }
        if (city) {
            filter["hospitalInfo.city"] = {
                $regex: city,
                $options: "i"
            };
        }
        if (category) {
            filter.category = category;
        }
        if (minFees || maxFees) {
            filter.fees = {};
            if (minFees) filter.fees.$gte = Number(minFees);
            if (maxFees) filter.fees.$lte = Number(maxFees);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { specialization: { $regex: search, $options: "i" } },
                { "hospitalInfo.name": { $regex: search, $options: "i" } },
            ];
        }

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Doctor.find(filter)
                .select("-password -googleId")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Doctor.countDocuments(filter),
        ]);

        res.ok(items, "Doctors fetched", {
            page: Number(page),
            limit: Number(limit),
            total,
        });

    } catch (error) {
        console.error("Doctor fetched failed", error);
        res.serverError("Doctor fetched failed", [error.message]);
    }
}



//controller for getting doctor profile by id
const doctorProfile = async (req, res) => {
    const doctor = await Doctor.findById(req.user._id).select("-password -googleId");
    res.ok(doctor, "Doctor Profile is Feteched")
}



//controller for updating doctor profile by id
const updateDoctorprofile = async (req, res) => {
    try {
        const update = { ...req.body }
        console.log(update);
        delete update.password;
        update.isVerified = true;  //mark profile verified on update 

        const doctor = await Doctor.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password -googleId");

        res.ok(doctor, "Doctor Profile Updated");

    } catch (error) {
        res.serverError("Doctor updated failed", [error.message]);
    }
}


const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findById(doctorId)
            .select("-password -googleId")
            .lean();

        if (!doctor) {
            return res.notFound("Doctor not found");
        }
        res.ok(doctor, "doctor details fetched successfully");

    } catch (error) {
        res.serverError("Fetching doctor failed", [error.message]);
    }
}



module.exports = { doctorList, doctorProfile, updateDoctorprofile, getDoctorById }