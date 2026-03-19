const express = require("express");
const appointmentRouter = express.Router();
const { protected, requireRole } = require("../middleware/auth");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");
const { doctorAppointment, patientAppointment, bookedSlotForDoctor, bookDoctor, appointmentById, joinVideoCall, endVideoCall, updateAppointmentStatus } = require("../controllers.js/appointmentControllers");



//doctor appointment
appointmentRouter.get("/doctor", protected, requireRole("doctor"),
    [
        query("status").optional().isArray().withMessage("Status can be an array"),
        query("status.*").optional().isString().withMessage("Each status must be an string"),
    ],
    validate,
    doctorAppointment
);

//patient appointment
appointmentRouter.get("/patient", protected, requireRole("patient"),
    [
        query("status").optional().isArray().withMessage("Status can be an array"),
        query("status.*").optional().isString().withMessage("Each status must be an string"),
    ],
    validate,
    patientAppointment
);



//Get booked slot for doctor on specific date
appointmentRouter.get("/booked-slots/:doctorId/:date", bookedSlotForDoctor);


//book appointment for patient only
appointmentRouter.post("/book", protected, requireRole("patient"),
    [
        body("doctorId").isMongoId().withMessage("valid doctor ID is required"),
        body("slotStartIso").isISO8601().withMessage("valid start time is required"),
        body("slotEndIso").isISO8601().withMessage("valid end time is required"),
        body("consultationType")
            .isIn(["Video Consultation", "Voice Call"])
            .withMessage("valid consultation type required"),
        body("symptoms")
            .isString()
            .trim()
            .withMessage("symptoms decsription is required (min 10 char)"),
        body("consultationFees")
            .isNumeric()
            .withMessage("consultationFees is required"),
        body("platformFees").isNumeric().withMessage("platformFees is required"),
        body("totalAmount").isNumeric().withMessage("totalAmount is required")
    ],
    validate,
    bookDoctor

);

//Get single appointment by id
appointmentRouter.get("/:id", protected, appointmentById);


//join video call
appointmentRouter.get("/join/:id", protected, joinVideoCall);

//end video call
appointmentRouter.put("/end/:id", protected, endVideoCall);

//update appointment status by doctor
appointmentRouter.put("/status/:id", protected, requireRole("patient"), updateAppointmentStatus)


module.exports = appointmentRouter;
