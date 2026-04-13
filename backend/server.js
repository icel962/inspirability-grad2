const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const schoolRoutes = require("./routes/schoolRoutes"); // if exists
const appointmentRoutes = require("./routes/appointmentRoutes"); // if exists
const profileRoutes = require("./routes/profileRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve images statically (if you upload files later)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", authRoutes);
app.use("/api", parentRoutes);
app.use("/api", schoolRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", profileRoutes); // NEW PROFILE ROUTE

// Root
app.get("/", (req, res) => {
  res.send("Inspirability API running");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
