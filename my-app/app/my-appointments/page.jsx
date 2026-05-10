"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl } from "@/app/lib/api";
import { normalizeAppointment } from "@/app/lib/normalizeAppointment";
import "./my-appointments.css";

export default function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [profileFallback, setProfileFallback] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch profile + appointments in parallel
    Promise.allSettled([
      axios.get(apiUrl("/api/profile"),          { headers }),
      axios.get(apiUrl("/api/appointments/my"),  { headers }),
    ]).then(([profileRes, apptRes]) => {
      // Profile → used as fallback when JOIN columns are null
      if (profileRes.status === "fulfilled") {
        const p = profileRes.value.data?.profile || {};
        setProfileFallback({
          name:  p.name   || "",
          email: p.email  || "",
          phone: p.tel_no || "",
        });
      }

      // Appointments
      if (apptRes.status === "fulfilled") {
        setAppointments(apptRes.value.data || []);
      } else {
        console.error("Failed to fetch appointments:", apptRes.reason);
      }
    }).finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this appointment request?")) return;
    try {
      await axios.delete(apiUrl(`/api/appointments/${id}`), {
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
      <div className="ma-page">
        <h2 className="ma-title">My Appointments</h2>
        <p className="ma-empty">Loading...</p>
      </div>
    );
  }

  return (
    <div className="ma-page">
      <h2 className="ma-title">My Appointments</h2>

      {appointments.length === 0 ? (
        <p className="ma-empty">You have no appointments yet.</p>
      ) : (
        appointments.map((raw) => {
          const a = normalizeAppointment(raw, profileFallback);
          return (
            <div key={a.id} className="ma-card">

              {/* DELETE BUTTON — pending only */}
              {raw.status === "pending" && (
                <button
                  className="ma-delete-btn"
                  onClick={() => handleDelete(a.id)}
                  title="Delete appointment"
                >
                  🗑️
                </button>
              )}

              {/* TWO-COLUMN GRID */}
              <div className="ma-grid">

                {/* LEFT COLUMN */}
                <div className="ma-col">
                  <div className="ma-field">
                    <span className="ma-label">Full Name</span>
                    <span className="ma-value">{a.fullName}</span>
                  </div>
                  <div className="ma-field">
                    <span className="ma-label">Phone Number</span>
                    <span className="ma-value">{a.phone}</span>
                  </div>
                  <div className="ma-field">
                    <span className="ma-label">Preferred Date</span>
                    <span className="ma-value">{a.preferredDate}</span>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="ma-col">
                  <div className="ma-field">
                    <span className="ma-label">Email Address</span>
                    <span className="ma-value">{a.email}</span>
                  </div>
                  <div className="ma-field">
                    <span className="ma-label">Appointment Type</span>
                    <span className="ma-value">{a.appointmentType}</span>
                  </div>
                  <div className="ma-field">
                    <span className="ma-label">Preferred Time</span>
                    <span className="ma-value">{a.preferredTime}</span>
                  </div>
                </div>

                {/* FULL-WIDTH ROWS */}
                <div className="ma-field ma-field--full">
                  <span className="ma-label">Notes</span>
                  <span className="ma-value">{a.notes || "No notes"}</span>
                </div>

                <div className="ma-field ma-field--full">
                  <span className="ma-label">Status</span>
                  <span className={`ma-status ma-status--${a.status}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>

              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
