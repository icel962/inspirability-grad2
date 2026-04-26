"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./my-appointments.css";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Fetch user profile data
  const fetchUserData = async (token) => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/parents/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.tel_no || ""
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch user data first
      await fetchUserData(token);

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
            <strong>Full Name:</strong>{" "}
            {userData.name || "N/A"}
          </p>

          <p>
            <strong>Email Address:</strong>{" "}
            {userData.email || "N/A"}
          </p>

          <p>
            <strong>Phone Number:</strong>{" "}
            {userData.phone || "N/A"}
          </p>

          <p>
            <strong>Appointment Type:</strong>{" "}
            {a.appointment_type || (a.type === "school" ? a.school_name : a.type === "sport" ? a.sport_center_name : a.type === "clinic" ? a.clinic_name : a.type) || "N/A"}
          </p>

          <p>
            <strong>Preferred Date:</strong>{" "}
            {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : "N/A"}
          </p>

          <p>
            <strong>Preferred Time:</strong>{" "}
            {a.appointment_time || "N/A"}
          </p>

          <p>
            <strong>Notes:</strong>{" "}
            {a.notes || "None"}
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