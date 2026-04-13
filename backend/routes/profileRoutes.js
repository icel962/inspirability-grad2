const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { authenticate } = require("../controllers/authController");

// Route: GET profile based on the logged-in user
router.get("/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; 
    const role = req.user.role.toLowerCase(); // Standardize to lowercase

    let tableName = "";

    switch (role) {
      case 'parent': tableName = 'parent'; break;
      case 'school': tableName = 'school'; break;
      case 'clinic': 
      case 'medical': tableName = 'medical_clinic'; break; // Supports both 'clinic' or 'medical'
      case 'sport': tableName = 'sport_center'; break;
      case 'admin': tableName = 'admin'; break;
      default: 
        return res.status(400).json({ message: "Invalid role" });
    }

    const [rows] = await db.promise().query(
      `SELECT * FROM ${tableName} WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile details not found for this role." });
    }

    res.json({
      role: role,
      profile: rows[0]
    });

  } catch (err) {
    console.error("Profile Route Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;