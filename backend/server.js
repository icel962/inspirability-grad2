const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/PaymentRouter.js");
const sportCenterRoutes = require("./routes/sportCenterRoutes");
const medicalClinicRoutes = require("./routes/medicalClinicRoutes");
const parentRoutes = require("./routes/parentRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Middlewares
const allowedOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.some((allowedOrigin) => allowedOrigin.test(origin))) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api", paymentRoutes);
app.use("/api", sportCenterRoutes);
app.use("/api", medicalClinicRoutes);
app.use("/api", parentRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", schoolRoutes); 
app.use("/api", profileRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


module.exports = app;
