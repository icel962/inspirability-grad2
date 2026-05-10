/**
 * Normalizes a raw appointment row (from /api/appointments/my or /api/appointments/provider)
 * into a clean display object.
 *
 * Fallback priority for parent identity fields (fullName, email, phone):
 *   1. Backend JOIN columns  (parent_name / parent_email / parent_phone)
 *   2. completedAppointments localStorage  — the full record saved at booking time,
 *      which contains the PARENT's real data regardless of who is currently logged in.
 *      This is what makes the Provider Appointments page show the correct parent details.
 *   3. userFallback argument — { name, email, phone } from the logged-in user's profile API.
 *      On the My Appointments (parent) page this IS the parent. On Provider Appointments
 *      it is intentionally left empty so we never fall through to the provider's own data.
 *
 * NOTE: localStorage.getItem("user") is intentionally NOT used as a fallback.
 * That key holds the currently logged-in user's data. On the Provider page that user
 * is the clinic/school/sport center, not the parent who booked — using it causes the
 * provider's own email to appear in place of the parent's email.
 *
 * @param {object} a            - Raw appointment object from the backend
 * @param {object} userFallback - { name, email, phone } from the caller's profile API (optional)
 */
export function normalizeAppointment(a, userFallback = {}) {
  // ── localStorage: data saved at booking time ─────────────────────────────
  let extraData  = {};   // { preferred_time, notes } — backward-compat key
  let storedAppt = {};   // full record saved by the appointment form
  try {
    const allExtra = JSON.parse(localStorage.getItem("appointmentsExtraData") || "{}");
    extraData = allExtra[String(a.appointment_id)] || {};

    const allCompleted = JSON.parse(localStorage.getItem("completedAppointments") || "[]");
    storedAppt = allCompleted.find((x) => String(x.id) === String(a.appointment_id)) || {};
  } catch (_) {}

  // ── User identity (parent) ────────────────────────────────────────────────
  const fullName = a.parent_name  || storedAppt.fullName  || userFallback.name  || "Unknown user";
  const email    = a.parent_email || storedAppt.email     || userFallback.email || "No email";
  const phone    = a.parent_phone || storedAppt.phone     || userFallback.phone || "Phone not available";

  // ── Appointment type / provider name ──────────────────────────────────────
  const appointmentType =
    a.appointment_type      ||
    storedAppt.appointmentType ||
    a.school_name           ||
    a.sport_center_name     ||
    a.clinic_name           ||
    (a.type ? (a.type.charAt(0).toUpperCase() + a.type.slice(1) + " appointment") : "") ||
    "Not specified";

  // ── Date ─────────────────────────────────────────────────────────────────
  let preferredDate = "Date not selected";
  if (a.appointment_date) {
    try {
      preferredDate = new Date(a.appointment_date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch (_) {
      preferredDate = String(a.appointment_date);
    }
  }

  // ── Time ─────────────────────────────────────────────────────────────────
  // Priority: DB column (HH:MM:SS) → full booking record → extraData backward-compat key
  const rawTime = a.appointment_time || storedAppt.preferredTime || extraData.preferred_time || "";
  let preferredTime = "Time not selected";
  if (rawTime) {
    try {
      const parts = String(rawTime).split(":");
      const h = Number(parts[0]);
      const m = Number(parts[1] || 0);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      preferredTime = d.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    } catch (_) {
      preferredTime = rawTime;
    }
  }

  // ── Notes ────────────────────────────────────────────────────────────────
  const notes = a.notes || storedAppt.notes || extraData.notes || "";

  // ── Status ───────────────────────────────────────────────────────────────
  // Always use the live API status (storedAppt.status is stale after Accept/Reject)
  const status = (a.status || storedAppt.status || "pending").toLowerCase();

  return {
    id: a.appointment_id,
    fullName,
    email,
    phone,
    appointmentType,
    preferredDate,
    preferredTime,
    notes,
    status,
  };
}
