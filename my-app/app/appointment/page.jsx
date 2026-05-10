"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/app/lib/api";
import "./appointment.css";
import SuccessModal from "@/app/components/shared/SuccessModal";
import "@/app/components/shared/SuccessModal.css";

// ─── Token helpers (unchanged) ────────────────────────────────────────────────

function getRawToken() {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
}

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// ─── localStorage fallback (same field names as /api/profile response) ────────
// Used only for the instant first render — the real fetch below overwrites it.
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "null") return { name: "", email: "", phone: "" };
    const u = JSON.parse(raw);
    // login query aliases parent.name → parent_name in the stored object
    return {
      name:  u.parent_name || u.name  || "",
      email: u.email || "",
      phone: u.tel_no || u.phone || "",
    };
  } catch {
    return { name: "", email: "", phone: "" };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAppointmentErrorMessage(result, fallback) {
  if (!result) return fallback;
  return result.message || result.detail || result.error || fallback;
}

function AppointmentContent() {
  const router = useRouter();

  // Pre-fill from localStorage instantly (no loading delay)
  const [userData, setUserData] = useState(getStoredUser);

  const [formData, setFormData] = useState({
    appointment_date:  "",
    appointment_type:  "",
    appointment_time:  "",
    notes:             "",
    status:            "pending",
  });

  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Date constraints — recalculated dynamically, never hardcoded
  const today       = new Date();
  const currentYear = today.getFullYear();
  const todayStr    = formatDateForInput(today);           // YYYY-MM-DD for input min
  const maxDateStr  = `${currentYear}-12-31`;              // YYYY-MM-DD for input max

  const searchParams = useSearchParams();
  const typeParam    = searchParams.get("type");
  const nameParam    = searchParams.get("name") || searchParams.get("schoolName");
  const idParam      = searchParams.get("id")   || searchParams.get("schoolId");
  const numericId    = Number(idParam);

  // Appointment type comes from the URL (card the user clicked)
  useEffect(() => {
    if (nameParam) {
      setFormData((prev) => ({ ...prev, appointment_type: nameParam }));
    }
  }, [nameParam]);

  // ── Fetch profile using the SAME endpoint and field mapping as Profile Page ──
  useEffect(() => {
    const token = getRawToken();

    if (!token || !isTokenValid(token)) {
      alert("Please log in again to book an appointment.");
      router.push("/login");
      return;
    }

    // Profile Page uses GET /api/profile → res.data.profile → profile.name / .email / .tel_no
    fetch(apiUrl("/api/profile"), {
      method: "GET",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`/api/profile → HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // data.profile is profile.profile in the Profile Page (same object)
        const p = data.profile;

        console.log("Profile data used for appointment:", p);

        // Mirror Profile Page field mapping exactly:
        //   Profile "Name"  → p.name   (parent.name column)
        //   Profile "Email" → p.email  (joined from users.email)
        //   Profile "Phone" → p.tel_no (parent.tel_no column)
        setUserData({
          name:  p.name   || "",
          email: p.email  || "",
          phone: p.tel_no || "",
        });
      })
      .catch((err) => {
        console.warn("Profile fetch failed, keeping localStorage values:", err.message);
      });
  }, [router]);

  // ── Field handlers ───────────────────────────────────────────────────────────
  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isTimeWithinWorkingHours = (time) => {
    if (!time) return false;
    const [hours, minutes] = time.split(":").map(Number);
    const selected = hours * 60 + minutes;
    return selected >= 480 && selected <= 1380;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── 1. Auth check (before setLoading so button never gets stuck) ───────────
    const token = getRawToken();
    if (!token || !isTokenValid(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      alert("Please log in again to book an appointment.");
      router.push("/login");
      return;
    }

    // ── 2. Date validation (before setLoading so button never gets stuck) ──────
    if (!["sport", "school", "clinic"].includes(typeParam)) {
      alert("Please open the appointment form from a valid service profile.");
      return;
    }

    if (!idParam || Number.isNaN(numericId)) {
      alert("Missing service details. Please go back and choose the service again.");
      return;
    }

    if (!formData.appointment_date) {
      alert("Please choose a preferred date.");
      return;
    }

    if (!formData.appointment_time) {
      alert("Please choose a preferred time.");
      return;
    }

    if (!isTimeWithinWorkingHours(formData.appointment_time)) {
      setTimeError("Preferred time must be between 8:00 AM and 11:00 PM.");
      return;
    }
    setTimeError("");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dynYear = todayStart.getFullYear();
    const maxDate = new Date(dynYear, 11, 31);   // Dec 31 of current year
    maxDate.setHours(23, 59, 59, 999);

    const selectedDate = new Date(`${formData.appointment_date}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      alert("Please choose a valid preferred date.");
      return;
    }
    selectedDate.setHours(0, 0, 0, 0);

    console.log("Preferred date raw value:",          formData.appointment_date);
    console.log("Selected date object:",              selectedDate);
    console.log("Today:",                             todayStart);
    console.log("Max allowed date:",                  maxDate);
    console.log("Is selected date in past:",          selectedDate < todayStart);
    console.log("Is selected date after max date:",   selectedDate > maxDate);

    if (selectedDate < todayStart) {
      alert("Preferred date cannot be in the past.");
      return;
    }
    if (selectedDate > maxDate) {
      alert(`Preferred date must be within ${dynYear}.`);
      return;
    }

    // ── 3. All checks passed — start loading ───────────────────────────────────
    setLoading(true);

    const bodyData = {
      appointment_date: formData.appointment_date,   // already YYYY-MM-DD from input
      appointment_time: formData.appointment_time,
      notes:            formData.notes || null,
      type:             typeParam,
      appointment_type: formData.appointment_type,
    };

    if (typeParam === "sport")  bodyData.sport_center_id = numericId;
    if (typeParam === "school") bodyData.school_id        = numericId;
    if (typeParam === "clinic") bodyData.clinic_id        = numericId;

    // ── Step 1: log everything before the request ─────────────────────────────
    console.log("Submitting appointment:");
    console.log(bodyData);
    console.log(JSON.stringify(bodyData, null, 2));

    const requestUrl    = apiUrl("/api/appointments");
    const requestMethod = "POST";
    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${token}`,
    };
    console.log("Request URL:",     requestUrl);
    console.log("Request method:",  requestMethod);
    console.log("Request headers:", requestHeaders);

    try {
      const response = await fetch(requestUrl, {
        method:  requestMethod,
        headers: requestHeaders,
        body:    JSON.stringify(bodyData),
      });

      // ── Step 2: log the full response ───────────────────────────────────────
      console.log("Response:", response);
      console.log("response.status:",     response.status);
      console.log("response.statusText:", response.statusText);

      const result = await response.json().catch(() => null);
      console.log("Response data:", result);

      if (response.ok) {
        // ── Step 4: persist appointment data to localStorage ──────────────────
        const insertedId = result?.id ?? result?.insertId ?? null;
        if (insertedId != null) {
          try {
            const idStr = String(insertedId);

            // Backward-compat key (time + notes only)
            const extra = JSON.parse(localStorage.getItem("appointmentsExtraData") || "{}");
            extra[idStr] = {
              preferred_time: formData.appointment_time,
              notes:          formData.notes || "",
            };
            localStorage.setItem("appointmentsExtraData", JSON.stringify(extra));

            // Full record — lets Provider Appointments read parent's real details
            // without needing a cross-browser session or extra API endpoint.
            const fullRecord = {
              id:              insertedId,
              fullName:        userData.name  || "",
              email:           userData.email || "",
              phone:           userData.phone || "",
              appointmentType: formData.appointment_type || nameParam || "",
              preferredDate:   formData.appointment_date,
              preferredTime:   formData.appointment_time,
              notes:           formData.notes || "",
              status:          "pending",
              providerType:    typeParam,
              providerId:      numericId,
            };
            const allCompleted = JSON.parse(localStorage.getItem("completedAppointments") || "[]");
            // Replace if this ID already exists, otherwise append
            const idx = allCompleted.findIndex((x) => String(x.id) === idStr);
            if (idx >= 0) allCompleted[idx] = fullRecord;
            else allCompleted.push(fullRecord);
            localStorage.setItem("completedAppointments", JSON.stringify(allCompleted));

            console.log("Extra appointment data saved for ID:", insertedId, extra[idStr]);
            console.log("Complete appointment record saved:", fullRecord);
          } catch (storageErr) {
            console.warn("Could not save appointment data to localStorage:", storageErr);
          }
        }

        setShowSuccessModal(true);
        setFormData({
          appointment_date: "",
          appointment_time: "",
          notes:            "",
          status:           "pending",
          appointment_type: formData.appointment_type,
        });
      } else if (response.status === 401) {
        console.warn("Auth rejected by server:", result);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        alert("Your session has expired. Please log in again.");
        router.push("/login");
      } else {
        console.warn("Appointment insert failed:", {
          status:     response.status,
          statusText: response.statusText,
          body:       result,
        });
        alert(getAppointmentErrorMessage(result, "Appointment insert failed"));
      }
    } catch (networkErr) {
      console.error("FULL INSERT ERROR:", networkErr);
      console.error("INSERT ERROR MESSAGE:", networkErr?.message);
      console.error("INSERT ERROR CODE:",    networkErr?.code);
      alert(networkErr?.message || "Cannot connect to server. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="appointment-section">
      <div className="appointment-wrapper">
        <h1>Appointment Form</h1>
        <p className="appointment-subtitle">
          Please fill the form below to schedule your visit.
        </p>

        <div className="appointment-card">
          <div className="card-content">
            <h2>Get In Touch</h2>
            <p className="card-subtitle">
              Verify your details and choose a preferred slot.
            </p>

            <form className="appointment-form" onSubmit={handleSubmit}>
              {/* AUTO-FILLED USER INFO — same source as Profile Page */}
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleUserDataChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={userData.email}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleUserDataChange}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Type</label>
                  <input
                    type="text"
                    name="appointment_type"
                    value={formData.appointment_type || ""}
                    readOnly
                    className="readonly-input"
                    placeholder="Select Category"
                  />
                </div>
              </div>

              {/* DATE AND TIME */}
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date</label>
                  <input
                    type="date"
                    name="appointment_date"
                    required
                    min={todayStr}
                    max={maxDateStr}
                    value={formData.appointment_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time</label>
                  <input
                    type="time"
                    name="appointment_time"
                    required
                    min="08:00"
                    max="23:00"
                    value={formData.appointment_time}
                    onChange={(e) => {
                      handleChange(e);
                      setTimeError("");
                    }}
                  />
                  {timeError && (
                    <p className="time-error-msg">{timeError}</p>
                  )}
                </div>
              </div>

              {/* NOTES */}
              <div className="form-group full-width">
                <label>Notes (Optional)</label>
                <textarea
                  name="notes"
                  placeholder="Tell us more about your request..."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="info-box">
                <h3>Terms & Conditions</h3>
                <ul>
                  <li>Confirmations are sent via email.</li>
                  <li>Cancellations must be 24 hours in advance.</li>
                </ul>
              </div>

              <button type="submit" className="send-btn" disabled={loading}>
                {loading ? "Processing..." : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          title="Appointment Confirmed"
          message={"Your appointment has been successfully booked.\nYou will be contacted with further details soon."}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </section>
  );
}

export default function Appointment() {
  return (
    <Suspense fallback={<div className="loading">Loading Appointment...</div>}>
      <AppointmentContent />
    </Suspense>
  );
}
