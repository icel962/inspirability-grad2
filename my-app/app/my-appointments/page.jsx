"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./my-appointments.css";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
  "http://localhost:5000/api/appointments/my",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to delete this request?")) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/appointments/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setAppointments(prev =>
      prev.filter(a => a.appointment_id !== id)
    );

  } catch (err) {
    console.error(err);
  }
};

  return (
  <div className="parent-container">
    <h2 className="title">My Appointments</h2>

    {appointments.map((a) => (
      <div key={a.appointment_id} className="appointment-card">

        <div className="card-info">
          <p>
            <strong>Date:</strong>{" "}
            {new Date(a.appointment_date).toLocaleDateString()}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {a.appointment_type || "N/A"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={`status ${a.status}`}>
              {a.status}
            </span>
          </p>
        </div>

        {/* 🗑️ أيقونة الحذف */}
        {a.status === "pending" && (
          <div
            className="delete-icon"
            onClick={() => handleDelete(a.appointment_id)}
          >
            🗑️
          </div>
        )}

      </div>
    ))}
  </div>
);
}