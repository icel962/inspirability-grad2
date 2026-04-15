const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
// 1. استدعي ملف الـ Payment Routes (تأكد من اسم الملف والمسار صح)
const paymentRoutes = require("./routes/PaymentRouter.js"); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الربط الصحيح للمسارات
app.use("/api", authRoutes); 

// 2. اربط مسارات الدفع بكلمة /api
app.use("/api", paymentRoutes); 

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});