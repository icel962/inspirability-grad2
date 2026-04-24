"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./provider-appointments.css";

export default function ProviderAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/appointments/provider",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAction = async (id, status) => {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/appointments/${id}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchAppointments();
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!confirm("Delete this request?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/provider/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments((prev) =>
        prev.filter((a) => a.appointment_id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="provider-container">
      <h2 className="title">طلبات الحجز</h2>

      {appointments.map((a) => (
        <div key={a.appointment_id} className="appointment-card">

          {/* 🗑️ أيقونة الحذف */}
          {a.status === "pending" && (
            <div
              className="delete-icon"
              onClick={() => handleDelete(a.appointment_id)}
            >
              🗑️
            </div>
          )}

          <div className="card-info">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(a.appointment_date).toLocaleDateString()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`status ${a.status}`}>
                {a.status}
              </span>
            </p>
          </div>

          {a.status === "pending" && (
            <div className="actions">
              <button
                className="btn approve"
                onClick={() =>
                  handleAction(a.appointment_id, "approved")
                }
              >
                Accept
              </button>

              <button
                className="btn reject"
                onClick={() =>
                  handleAction(a.appointment_id, "rejected")
                }
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}