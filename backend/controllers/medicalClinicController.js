const db = require("../db/db");

// Get all medical clinics
exports.getAllMedicalClinics = (req, res) => {
const query = `
  SELECT 
    m.clinic_id,
    m.clinic_name,
    m.clinic_type,
    m.specialized_therapists,
    m.email,
    m.phone_number,
    m.location,
    m.working_hours_and_days,
    m.session_price_range,
    m.certifications_availability,
    m.specialization_type,
    m.sliding_equipments,
    m.user_id

  FROM medical_clinic m

  JOIN users u
    ON m.user_id = u.user_id

  WHERE
    u.approval_status = 'approved'
    AND u.payment_status = 'approved'
`;

  db.query(query, (err, result) => {
    if (err) {
      console.error("MEDICAL CLINIC FETCH ERROR:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    res.json(result);
  });
};

// Get a single medical clinic by ID
exports.getMedicalClinicById = (req, res) => {
  const { id } = req.params;

const query = `
  SELECT 
    m.clinic_id,
    m.clinic_name,
    m.clinic_type,
    m.specialized_therapists,
    m.email,
    m.phone_number,
    m.location,
    m.working_hours_and_days,
    m.session_price_range,
    m.certifications_availability,
    m.specialization_type,
    m.sliding_equipments,
    m.user_id

  FROM medical_clinic m

  JOIN users u
    ON m.user_id = u.user_id

  WHERE 
    m.clinic_id = ?
    AND u.approval_status = 'approved'
    AND u.payment_status = 'approved'
`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("MEDICAL CLINIC FETCH ERROR:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Medical clinic not found" });
    }

    res.json(result[0]);
  });
};
