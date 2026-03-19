const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");



//doctor Appointment
const doctorAppointment = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { doctorId: req.auth.id };

        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            filter.status = { $in: statusArray };
        }

        const appointment = await Appointment.find(filter)
            .populate("patientId", "name email phone dob age profileImage")
            .populate("doctorId", "name fees phone specialization profileImage hospitalInfo")
            .sort({ slotStartIso: 1, slotEndIso: 1 });


        res.ok(appontment, "Appointment Fetched Succefully");

    } catch (error) {
        console.error("Doctor appointment fetch error", error);
        res, serverError("Failed to fetch appointment", [error.message]);
    }
};


//doctor Appointment
const patientAppointment = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { patientId: req.auth.id };

        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            filter.status = { $in: statusArray };
        }
        const appointment = await Appointment.find(filter)
            .populate(
                "doctorId",
                "name fees phone specialization hospitalInfo profileImage"
            )
            .populate("patientId", "name email profileImage")
            .sort({ slotStartIso: 1, slotEndIso: 1 });

        res.ok(appointment, "Appointment fetched successfully");
    } catch (error) {
        console.error("Patient appointment fetch error", error);
        res, serverError("Failed to fetch appointment", [error.message]);
    }
};


//Get booked slot for doctor on specific date
const bookedSlotForDoctor = async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        const startDay = new Date(date);
        startDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointment = await Appointment.find({
            doctorId,
            slotStartIso: { $gte: startDay, $lte: endOfDay },
            status: { $ne: "Cancelled" },
        }).select("slotStartIso");

        const bookedSlot = bookedAppointment.map((apt) => apt.slotStartIso);

        res.ok(bookedSlot, "Booked slot retrieved");

    } catch (error) {
        res, serverError("Failed to fetch booked slot", [error.message]);
    }
}


//appointment booking fot patient only
const bookDoctor = async (req, res) => {
    try {
        const {
            doctorId, slotStartIso, slotEndIso, date, consultationType, symptoms, consultationFees,
            platformFees,
            totalAmount,
        } = req.body;

        const conflictAppointment = await Appointment.find({
            doctorId,
            status: { $in: ["Scheduled", "In Progress"] },
            $or: [
                {
                    slotStartIso: { $lt: new Date(slotEndIso) },
                    slotEndIso: { $gt: new Date(slotStartIso) },
                },
            ],
        });

        if (confictingAppointment) {
            return res.forbidden("This time slot is alredy booked");
        }

        //Generate unique roomId for the video call
        const zegoRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const appointment = new Appointment({
            doctorId,
            patientId: req.auth.id,
            date: new Date(date),
            slotStartIso: new Date(slotStartIso),
            slotEndIso: new Date(slotEndIso),
            consultationType,
            symptoms,
            zegoRoomId,
            status: "Scheduled",
            consultationFees,
            platformFees,
            totalAmount,
            paymentStatus: "Pending",
            payoutStatus: "Pending",
        });

        await appointment.save();

        await appointment.populate(
            "doctorId",
            "name fees phone specialization hospitalInfo profileImage"
        );
        await appointment.populate("patientId", "name email");

        res.created(appointment, "Appointment booked successfully");

    } catch (error) {
        console.error("Book appointment error", error);
        res, serverError("Failed to book appointment", [error.message]);
    }
};



//get sinngle appointment by id
const appointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate("patientId", "name email phone dob age profileImage")
            .populate(
                "doctorId",
                "name fees phone specialization hospitalInfo profileImage"
            );

        if (!appointment) {
            return res.notFound("Appointment not found");
        }

        //check if user has access to this appointment
        const userRole = req.auth.type;
        if (
            userRole === "doctor" &&
            appointment.doctorId._id.toString() !== req.auth.id
        ) {
            return res.forbidden("Access denied");
        }

        if (
            userRole === "patient" &&
            appointment.patientId._id.toString() !== req.auth.id
        ) {
            return res.forbidden("Access denied");
        }

        res.ok({ appointment }, "Appointment fetched successfully");

    } catch (error) {
        console.error("Get appointment error", error);
        res, serverError("Failed to Get appointment", [error.message]);
    }
}


//join video call
const joinVideoCall = async (req, res) => {
    try {

        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            .populate("patientId", "name ")
            .populate("doctorId", "name");

        if (!appointment) {
            return res.notFound("Appointment not found");
        }

        appointment.status = "In Progress";
        await appointment.save();

        const roomId = appointment.zegoRoomId;

        res.ok(
            { roomId, appointment },
            "Consultation joined successfully"
        );

    } catch (error) {
        console.error("Join consultation error", error);
        res, serverError("Failed to Join consultation", [error.message]);
    }
}


//End video call
const endVideoCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { prescription, notes } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                status: "Completed",
                prescription,
                notes,
                updatedAt: new Date(),
            },
            { new: true }
        ).populate("patientId doctorId");

        if (!appointment) {
            return res.notFound("Appointment not found");
        }

        res.ok(appointment, "Consultation completed successfully");

    } catch (error) {
        console.error("End consultation error", error);
        res, serverError("Failed to End consultation", [error.message]);
    }
}

//update appointment status by doctor only
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id).populate(
            "patientId doctorId"
        );

        if (!appointment) {
            return res.notFound("Appointment not found");
        }

        if (appointment.doctorId._id.toString() !== req.auth.id) {
            return res.forbidden("Access denied");
        }

        appointment.status = status;
        appointment.updatedAt = new Date();
        await appointment.save();

        res.ok(appointment, "Appointment status updated successfully");
    } catch (error) {
        console.error("updated Appointment status error", error);
        res, serverError("Failed to updated Appointment status", [error.message]);
    }
}






module.exports = {
    doctorAppointment,
    patientAppointment,
    bookedSlotForDoctor,
    bookDoctor,
    appointmentById,
    joinVideoCall,
    endVideoCall,
    updateAppointmentStatus
};