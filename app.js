const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("./config/passportConfig");

const db = require("./config/database.js");

const authRoutes = require("./routes/auth/authRoutes.js");
const googleRoutes = require("./routes/auth/googleRoutes.js");
const OTPRoutes = require("./routes/auth/OTPRoute.js");
const profileRouter = require("./routes/userRoutes.js");
const businessesRouter = require("./routes/businessRouter.js");
const professionalsRouter = require("./routes/professionalsRoutes");
const businessPhotosRoutes = require("./routes/businessPhotosRoutes.js");
const servicesRoutes = require("./routes/servicesRoutes");
const queuesRoutes = require("./routes/queuesRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes.js");
const passwordRoutes = require("./routes/passwordRoutes.js");

const scheduleNotificationAppointment = require("./notifications/notificationsApoitment");
const limiter = require("./utils/requestsLimiter.js");

const app = express();

/* app.use(limiter);*/

db.authenticate()
  .then(() => console.log("database connected"))
  .catch((err) => console.log("Error connecting to the database", err));

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:4200', "https://serviceflow.me"],  // só permite este domínio
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true  // permite cookies, autenticação etc.
}));

app.use(express.json());

app.use(passport.initialize());

app.use("/", express.static("public/"));

app.use("/api", [
  authRoutes,
  googleRoutes,
  OTPRoutes,
  profileRouter,
  businessesRouter,
  professionalsRouter,
  businessPhotosRoutes,
  servicesRoutes,
  queuesRoutes,
  reviewsRoutes,
  passwordRoutes,
]);

scheduleNotificationAppointment();

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
