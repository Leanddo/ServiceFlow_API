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

const app = express();

db.authenticate()
  .then(() => console.log("database connected"))
  .catch((err) => console.log("Error connecting to the database", err));

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  })
);
app.use(express.json());

app.use(passport.initialize());

app.use("/userImg", express.static("public/userImg"));

app.use("/api", [
  authRoutes,
  googleRoutes,
  OTPRoutes,
  profileRouter,
  businessesRouter,
  professionalsRouter,
  businessPhotosRoutes
]);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
  