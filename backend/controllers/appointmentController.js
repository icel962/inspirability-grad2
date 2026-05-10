const db = require("../db/db");

// ==============================
// CREATE APPOINTMENT
// ==============================
exports.createAppointment = (req, res) => {
  try {
    const user_id = req.user.id;

    // ── DEBUG: log every field the frontend sent ──────────────────────────────
    console.log("RECEIVED APPOINTMENT BODY:", req.body);

    const {
      appointment_date,
      appointment_time,
      notes,
      type,
      appointment_type,   // place/service name displayed in the form
      clinic_id,
      sport_center_id,
      school_id,
    } = req.body;

    if (!appointment_date || !type) {
      return res.status(400).json({ message: "appointment_date and type are required" });
    }

    if (type === "clinic" && !clinic_id)
      return res.status(400).json({ message: "clinic_id is required" });
    if (type === "sport" && !sport_center_id)
      return res.status(400).json({ message: "sport_center_id is required" });
    if (type === "school" && !school_id)
      return res.status(400).json({ message: "school_id is required" });

    // =========================
    // GET parent_id
    // =========================
    db.query(
      "SELECT parent_id FROM parent WHERE user_id = ?",
      [user_id],
      (err, parentResult) => {
        if (err) {
          console.error("REAL APPOINTMENT INSERT ERROR:", err);
          console.error("DATABASE ERROR MESSAGE:", err.message);
          return res.status(500).json({ message: "DB error", detail: err.sqlMessage || err.message });
        }

        if (parentResult.length === 0)
          return res.status(400).json({ message: "Parent not found. Only Parent accounts can book appointments." });

        const parent_id = parentResult[0].parent_id;
        let provider_user_id = null;

        // =========================
        // GET provider_user_id
        // =========================
        const getProvider = (query, id) => {
          db.query(query, [id], (err, result) => {
            if (err) {
              console.error("Provider lookup error:", err);
              return res.status(400).json({ message: "Provider lookup failed", detail: err.sqlMessage || err.message });
            }
            if (result.length === 0)
              return res.status(400).json({ message: "Provider not found for the given ID" });

            // user_id may be named differently in some tables — grab the first numeric column if needed
            provider_user_id = result[0].user_id ?? result[0].id ?? null;
            console.log("Provider user_id resolved:", provider_user_id, "| raw row:", result[0]);
            insertAppointment();
          });
        };

        if (type === "clinic")
          getProvider("SELECT user_id FROM medical_clinic WHERE clinic_id = ?", clinic_id);
        else if (type === "sport")
          getProvider("SELECT user_id FROM sport_center WHERE sport_center_id = ?", sport_center_id);
        else if (type === "school")
          getProvider("SELECT user_id FROM school WHERE school_id = ?", school_id);
        else
          return res.status(400).json({ message: "Invalid type" });

        // =========================
        // INSERT — built dynamically so it adapts to the real table schema.
        // Uses a dedicated connection with FOREIGN_KEY_CHECKS=0 because the
        // schema SQL has broken FK references (wrong table/column names).
        // =========================
        function insertAppointment() {
          db.query("DESCRIBE appointment", (descErr, tableInfo) => {
            if (descErr) {
              console.error("DESCRIBE appointment failed:", descErr);
              return res.status(500).json({
                message: descErr.sqlMessage || descErr.message,
                detail:  descErr.sqlMessage || descErr.message,
                code:    descErr.code,
              });
            }

            const existingCols = tableInfo.map((col) => col.Field);
            console.log("APPOINTMENT TABLE ACTUAL COLUMNS:", existingCols);

            // ── Build the INSERT column / value lists ─────────────────────────
            const cols = [];
            const vals = [];

            const addIf = (col, val) => {
              if (existingCols.includes(col)) {
                cols.push(col);
                vals.push(val);
              }
            };

            // Required
            addIf("parent_id",        parent_id);
            addIf("appointment_date", appointment_date);

            // Optional / nullable
            addIf("appointment_time", appointment_time
              ? (appointment_time.length === 5 ? appointment_time + ":00" : appointment_time)
              : null);
            addIf("notes",  notes || "");
            addIf("status", "pending");

            // category columns — both names possible depending on migration
            addIf("type",             type);
            addIf("appointment_type", appointment_type || type);

            // user_id of the logged-in parent (present in some live table versions)
            addIf("user_id", user_id);

            // provider link — only when resolved
            if (provider_user_id != null) addIf("provider_user_id", provider_user_id);

            // FK IDs — cast to INT
            if (clinic_id)       addIf("clinic_id",       Number(clinic_id));
            if (sport_center_id) addIf("sport_center_id", Number(sport_center_id));
            if (school_id)       addIf("school_id",       Number(school_id));

            const placeholders = cols.map(() => "?").join(", ");
            const insertQuery  = `INSERT INTO appointment (${cols.join(", ")}) VALUES (${placeholders})`;

            console.log("FINAL INSERT QUERY:", insertQuery);
            console.log("FINAL INSERT VALUES:", vals);

            // Use a dedicated connection so FK_CHECKS=0 is session-scoped
            // (broken FK: appointment.user_id → users.id, but PK is users.user_id)
            db.getConnection((connErr, connection) => {
              if (connErr) {
                console.error("DB connection error:", connErr);
                return res.status(500).json({
                  message: connErr.message || "DB connection error",
                  detail:  connErr.message,
                });
              }

              connection.query("SET FOREIGN_KEY_CHECKS = 0", (setErr) => {
                if (setErr) {
                  console.error("SET FK_CHECKS error:", setErr);
                  connection.release();
                  return res.status(500).json({
                    message: setErr.sqlMessage || setErr.message,
                    detail:  setErr.sqlMessage || setErr.message,
                  });
                }

                connection.query(insertQuery, vals, (err, result) => {
                  // Re-enable FK checks and release — fire and forget
                  connection.query("SET FOREIGN_KEY_CHECKS = 1", () => connection.release());

                  if (err) {
                    console.error("REAL APPOINTMENT INSERT ERROR:", err);
                    console.error("DATABASE ERROR MESSAGE:",    err.message);
                    console.error("DATABASE ERROR SQLMESSAGE:", err.sqlMessage);
                    console.error("DATABASE ERROR CODE:",       err.code);
                    console.error("DATABASE ERROR ERRNO:",      err.errno);
                    console.error("DATABASE ERROR SQL:",        err.sql);
                    const realMsg = err.sqlMessage || err.message || err.code || String(err) || "Unknown DB error";
                    return res.status(500).json({
                      message: realMsg,
                      detail:  realMsg,
                      code:    err.code,
                      errno:   err.errno,
                    });
                  }

                  res.json({
                    message: "Appointment sent successfully ✅",
                    id: result.insertId,
                  });
                });
              });
            });
          });
        }
      }
    );
  } catch (err) {
    console.error("REAL APPOINTMENT INSERT ERROR:", err);
    console.error("DATABASE ERROR MESSAGE:", err.message);
    console.error("DATABASE ERROR DETAILS:", err);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};

// ==============================
// GET PROVIDER APPOINTMENTS
// ==============================
exports.getProviderAppointments = (req, res) => {
  const user_id = req.user.id;

  db.query(
    `SELECT a.*,
        p.name         AS parent_name,
        p.tel_no       AS parent_phone,
        u.email        AS parent_email,
        sc.sport_center_name,
        s.school_name,
        mc.clinic_name
     FROM appointment a
     LEFT JOIN parent         p  ON a.parent_id      = p.parent_id
     LEFT JOIN users          u  ON p.user_id         = u.user_id
     LEFT JOIN sport_center   sc ON a.sport_center_id = sc.sport_center_id
     LEFT JOIN school         s  ON a.school_id        = s.school_id
     LEFT JOIN medical_clinic mc ON a.clinic_id        = mc.clinic_id
     WHERE a.provider_user_id = ?
     ORDER BY
       FIELD(a.status, 'pending', 'approved', 'rejected'),
       a.appointment_date DESC`,
    [user_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(result);
    }
  );
};

// ==============================
// GET PARENT APPOINTMENTS
// ==============================
exports.getParentAppointments = (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT parent_id FROM parent WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0)
        return res.status(400).json({ message: "Parent not found" });

      const parent_id = result[0].parent_id;

      db.query(
        `SELECT a.*,
            p.name         AS parent_name,
            p.tel_no       AS parent_phone,
            u.email        AS parent_email,
            sc.sport_center_name,
            s.school_name,
            mc.clinic_name
         FROM appointment a
         LEFT JOIN parent         p  ON a.parent_id      = p.parent_id
         LEFT JOIN users          u  ON p.user_id         = u.user_id
         LEFT JOIN sport_center   sc ON a.sport_center_id = sc.sport_center_id
         LEFT JOIN school         s  ON a.school_id        = s.school_id
         LEFT JOIN medical_clinic mc ON a.clinic_id        = mc.clinic_id
         WHERE a.parent_id = ?
         ORDER BY
           FIELD(a.status, 'pending', 'approved', 'rejected'),
           a.appointment_date DESC`,
        [parent_id],
        (err, appointments) => {
          if (err)
            return res.status(500).json({ message: "Fetch error" });

          res.json(appointments);
        }
      );
    }
  );
};

// ==============================
// UPDATE STATUS (APPROVE / REJECT)
// ==============================
exports.updateAppointmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.query(
    "UPDATE appointment SET status = ? WHERE appointment_id = ? AND provider_user_id = ?",
    [status, id, user_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json({ message: "Updated successfully ✅" });
    }
  );
};

// ==============================
// DELETE APPOINTMENT
// ==============================

exports.deleteAppointment = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query(
    "SELECT parent_id FROM parent WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0)
        return res.status(400).json({ message: "Parent not found" });

      const parent_id = result[0].parent_id;

      db.query(
        "DELETE FROM appointment WHERE appointment_id = ? AND parent_id = ?",
        [id, parent_id],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Delete error" });

          if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Not authorized" });
          }

          res.json({ message: "Deleted successfully ✅" });
        }
      );
    }
  );
};

// ==============================
// DELETE PROVIDER APPOINTMENT
// ==============================
exports.deleteProviderAppointment = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM appointment WHERE appointment_id = ? AND provider_user_id = ?",
    [id, user_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Delete error" });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json({ message: "Deleted successfully ✅" });
    }
  );
};