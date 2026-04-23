const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { authenticate } = require("../controllers/authController");

// ==============================
// GET PROFILE (USER + ROLE DATA)
// ==============================
router.get("/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role.toLowerCase();

    // GET USER INFO
    const [userRows] = await db.promise().query(
      "SELECT user_id, email, role FROM users WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // ROLE TABLE SELECT
    let tableName = "";

    switch (role) {
      case "parent":
        tableName = "parent";
        break;
      case "school":
        tableName = "school";
        break;
      case "clinic":
      case "medical":
        tableName = "medical_clinic";
        break;
      case "sport":
        tableName = "sport_center";
        break;
      case "admin":
        tableName = "admin";
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // GET PROFILE DATA
    const [profileRows] = await db.promise().query(
      `SELECT * FROM ${tableName} WHERE user_id = ?`,
      [userId]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      user,
      role,
      profile: profileRows[0],
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile/update", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role.toLowerCase();
    const data = req.body;

    let table = "";

    switch (role) {
      case "parent":
        table = "parent";
        break;
      case "school":
        table = "school";
        break;
      case "sport":
        table = "sport_center";
        break;
      case "clinic":
      case "medical":
        table = "medical_clinic";
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // REMOVE user_id from update fields
    delete data.user_id;

    const fields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(data);

    await db.promise().query(
      `UPDATE ${table} SET ${fields} WHERE user_id = ?`,
      [...values, userId]
    );

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;