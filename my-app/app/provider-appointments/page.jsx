"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl } from "@/app/lib/api";
import { normalizeAppointment } from "@/app/lib/normalizeAppointment";
import "./provider-appointments.css";

export default function ProviderAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const res = await axios.get(apiUrl("/api/appointments/provider"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch provider appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleAction = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        apiUrl(`/api/appointments/${id}`),
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list after status change
      await fetchAppointments();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Could not update appointment status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Delete this appointment request?")) return;
    try {
      await axios.delete(apiUrl(`/api/appointments/provider/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a.appointment_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete the appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pa-page">
        <h2 className="pa-title">Appointments</h2>
        <p className="pa-empty">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pa-page">
      <h2 className="pa-title">Appointments</h2>

      {appointments.length === 0 ? (
        <p className="pa-empty">No appointment requests yet.</p>
      ) : (
        appointments.map((raw) => {
          const a = normalizeAppointment(raw);
          return (
            <div key={a.id} className="pa-card">

              {/* DELETE — pending only */}
              {raw.status === "pending" && (
                <button
                  className="pa-delete-btn"
                  onClick={() => handleDelete(a.id)}
                  title="Delete appointment"
                >
                  🗑️
                </button>
              )}

              {/* TWO-COLUMN GRID */}
              <div className="pa-grid">

                {/* LEFT COLUMN */}
                <div className="pa-col">
                  <div className="pa-field">
                    <span className="pa-label">Full Name</span>
                    <span className="pa-value">{a.fullName}</span>
                  </div>
                  <div className="pa-field">
                    <span className="pa-label">Phone Number</span>
                    <span className="pa-value">{a.phone}</span>
                  </div>
                  <div className="pa-field">
                    <span className="pa-label">Preferred Date</span>
                    <span className="pa-value">{a.preferredDate}</span>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="pa-col">
                  <div className="pa-field">
                    <span className="pa-label">Email Address</span>
                    <span className="pa-value">{a.email}</span>
                  </div>
                  <div className="pa-field">
                    <span className="pa-label">Appointment Type</span>
                    <span className="pa-value">{a.appointmentType}</span>
                  </div>
                  <div className="pa-field">
                    <span className="pa-label">Preferred Time</span>
                    <span className="pa-value">{a.preferredTime}</span>
                  </div>
                </div>

                {/* FULL-WIDTH ROWS */}
                <div className="pa-field pa-field--full">
                  <span className="pa-label">Notes</span>
                  <span className="pa-value">{a.notes || "No notes"}</span>
                </div>

                <div className="pa-field pa-field--full">
                  <span className="pa-label">Status</span>
                  <span className={`pa-status pa-status--${a.status}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>

              </div>

              {/* ACCEPT / REJECT — pending only */}
              {raw.status === "pending" && (
                <div className="pa-actions">
                  <button
                    className="pa-btn pa-btn--accept"
                    onClick={() => handleAction(a.id, "approved")}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="pa-btn pa-btn--reject"
                    onClick={() => handleAction(a.id, "rejected")}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}
