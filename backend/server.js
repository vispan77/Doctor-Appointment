const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
// const bodyParser = require("body-parser")
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");
const response = require("./middleware/response");
const authRouter = require("./Routes/authRouter");
const doctorRouter = require("./Routes/doctorRouter");
const patientRouter = require("./Routes/patientRouter");
const passportLib = require("passport");
const passport = require('./config/passport');
const appointmentRouter = require("./Routes/appointmentRouter");



dotenv.config();


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());

//helmet is a security middleware for Express 
//It helps protect your app by settings various HTTP headers
app.use(helmet());

//morgan is an HTTP request logger middleware
app.use(morgan('dev'));

app.use(cors({
    origin: (process.env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean) || "*",
    credentials: true
}));

app.use(response);

//initialise password
app.use(passportLib.initialize());

//router middleware
app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/appointment", appointmentRouter);



//db connection
dbConnect();


app.get("/health", (req, res) => {
    res.ok({ time: new Date().toISOString() }, "OK")
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`server is listerning on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Welcome to the page");
});





