const express = require("express")
const router = express.Router()
const appointmentController = require("../controllers/appointmentController")
const { authenticate } = require("../controllers/authController")

router.post("/appointments/create", authenticate, appointmentController.createAppointment)

module.exports = router
