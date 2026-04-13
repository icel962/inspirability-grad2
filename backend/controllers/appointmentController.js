const db = require("../db/db");

exports.createAppointment = (req, res) => {
  try {
    const user_id = req.user.id;

    const { appointment_date, type, status = "pending" } = req.body;

    if (!appointment_date || !type) {
      return res.status(400).json({
        message: "appointment_date and type are required",
      });
    }

    // 🔥 STEP 1: Get parent_id from parent table
    db.query(
      "SELECT parent_id FROM parent WHERE user_id = ?",
      [user_id],
      (err, parentResult) => {
        if (err) {
          console.error("PARENT FETCH ERROR:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (parentResult.length === 0) {
          return res.status(400).json({
            message: "No parent profile found for this user",
          });
        }

        const parent_id = parentResult[0].parent_id;

        // 🔥 STEP 2: Map type → IDs
        let clinic_id = null;
        let sport_center_id = null;
        let school_id = null;

        if (type === "clinic") {
          clinic_id = 1; // temp
        } else if (type === "sport") {
          sport_center_id = 1;
        } else if (type === "school") {
          school_id = 1;
        } else {
          return res.status(400).json({ message: "Invalid type" });
        }

        // 🔥 STEP 3: Insert appointment
        const query = `
          INSERT INTO appointment 
          (parent_id, appointment_date, clinic_id, sport_center_id, school_id, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          query,
          [
            parent_id,
            appointment_date,
            clinic_id,
            sport_center_id,
            school_id,
            status,
          ],
          (err, result) => {
            if (err) {
              console.error("APPOINTMENT ERROR:", err);
              return res.status(500).json({
                message: "Database error",
                error: err.message,
              });
            }

            res.json({
              message: "Appointment created successfully",
              appointmentId: result.insertId,
            });
          }
        );
      }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};