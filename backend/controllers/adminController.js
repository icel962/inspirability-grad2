const db = require("../db/db");

// ===============================
// GET PROVIDER REQUESTS
// ===============================
exports.getProviderRequests = (req, res) => {
  const query = `
    SELECT 
      user_id,
      email,
      role,
      approval_status,
      payment_status
    FROM users
    WHERE
      role IN ('school', 'clinic', 'sport')
      AND approval_status = 'pending'
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "DB error",
      });
    }

    res.json(result);
  });
};

// ===============================
// APPROVE PROVIDER
// ===============================
exports.approveProvider = (req, res) => {
  const { id } = req.params;

  db.query(
    `UPDATE users
     SET approval_status = 'approved'
     WHERE user_id = ?`,
    [id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "DB error",
        });
      }

      res.json({
        message: "Provider approved",
      });
    }
  );
};

// ===============================
// REJECT PROVIDER
// ===============================
exports.rejectProvider = (req, res) => {
  const { id } = req.params;

  db.query(
    `UPDATE users
     SET approval_status = 'rejected'
     WHERE user_id = ?`,
    [id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "DB error",
        });
      }

      res.json({
        message: "Provider rejected",
      });
    }
  );
};

// ===============================
// PAYMENT REQUESTS
// ===============================
exports.getPaymentRequests = (req, res) => {
  const query = `
    SELECT 
      user_id,
      email,
      role,
      payment_status
    FROM users
    WHERE
      role IN ('school', 'clinic', 'sport')
      AND payment_status = 'pending'
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "DB error",
      });
    }

    res.json(result);
  });
};

// ===============================
// APPROVE PAYMENT
// ===============================
exports.approvePayment = (req, res) => {
  const { id } = req.params;

  db.query(
    `UPDATE users
     SET payment_status = 'approved'
     WHERE user_id = ?`,
    [id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "DB error",
        });
      }

      res.json({
        message: "Payment approved",
      });
    }
  );
};

// ===============================
// REJECT PAYMENT
// ===============================
exports.rejectPayment = (req, res) => {
  const { id } = req.params;

  db.query(
    `UPDATE users
     SET payment_status = 'rejected'
     WHERE user_id = ?`,
    [id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "DB error",
        });
      }

      res.json({
        message: "Payment rejected",
      });
    }
  );
};