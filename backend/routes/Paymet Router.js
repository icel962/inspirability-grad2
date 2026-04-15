const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../controllers/authController"); // الـ Middleware الخاص بك

// مسار لإتمام عملية دفع جديدة
router.post("/pay", authenticate, paymentController.createPayment);

// مسار لعرض تاريخ مدفوعات المستخدم
router.get("/my-history", authenticate, paymentController.getMyPayments);

module.exports = router;