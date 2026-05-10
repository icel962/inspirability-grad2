"use client";
import "./admin.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from "chart.js";

import { Line } from "react-chartjs-2";
import { contacts as staticContacts } from "../contact-details/contacts-data";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);


// Maps admin category label → specialty key used by the Contacts page filter
const CATEGORY_TO_SPECIALTY = {
  Doctor: "medical",
  "Private Doctor": "medical",
  Therapist: "therapy",
  "Private Therapist": "therapy",
  Teacher: "education",
  "Private Teacher": "education",
  Coach: "sports",
  "Private Trainer": "sports",
};

const EMPTY_FORM = {
  name: "", category: "", specialization: "", phone: "",
  email: "", location: "", availability: "", status: "Available",
  budget: "", rating: "", image: "", description: "",
};

export default function Dashboard() {
  useEffect(() => { drawChart(); }, []);

  const [form, setForm]                       = useState(EMPTY_FORM);
  const [formError, setFormError]             = useState("");
  const [adminContacts, setAdminContacts]     = useState([]);
  const [hiddenStaticIds, setHiddenStaticIds] = useState(new Set());
  const [photoFile, setPhotoFile]             = useState(null);
  const [photoPreview, setPhotoPreview]       = useState(null);

  // Load from localStorage once on mount
  useEffect(() => {
    const storedContacts = JSON.parse(localStorage.getItem("contactsData") || "[]");
    console.log("Admin static contacts:", staticContacts);
    console.log("Admin stored contacts:", storedContacts);
    setAdminContacts(storedContacts);
  }, []);

  // allContacts is always derived — never stored in state
  const allContacts = useMemo(() => {
    const visibleStatic = staticContacts.filter(
      (c) => !hiddenStaticIds.has(String(c.id))
    );
    const merged = [...visibleStatic, ...adminContacts];
    console.log("Admin rendered contacts:", merged);
    return merged;
  }, [hiddenStaticIds, adminContacts]);

  const storedIds = useMemo(
    () => new Set(adminContacts.map((c) => String(c.id))),
    [adminContacts]
  );

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddContact = () => {
    if (!form.name.trim())  { setFormError("Name is required.");     return; }
    if (!form.category)     { setFormError("Category is required."); return; }
    setFormError("");

    const budgetRaw  = form.budget.trim();
    const budgetValue = budgetRaw
      ? (budgetRaw.toLowerCase().includes("egp") ? budgetRaw : `EGP ${budgetRaw} / session`)
      : "EGP 0 / session";

    const newContact = {
      id:             String(Date.now()),
      name:           form.name.trim(),
      role:           form.specialization.trim() || form.category,
      category:       form.category,
      specialty:      CATEGORY_TO_SPECIALTY[form.category] || "education",
      specialization: form.specialization.trim(),
      budgetValue,
      budgetLabel:    "Standard",
      review:         Number(form.rating) || 0,
      reviewLabel:    `${form.rating || 0} rating`,
      reviewsCount:   0,
      status:         form.status || "Available",
      phone:          form.phone.trim(),
      email:          form.email.trim(),
      location:       form.location.trim(),
      availability:   form.availability.trim(),
      description:    form.description.trim(),
      image:          photoPreview || form.image.trim() || "images/default-profile.svg",
      distanceKm:     15,   // default distance for the Contacts page filter
    };

    const updated = [...adminContacts, newContact];
    localStorage.setItem("contactsData", JSON.stringify(updated));
    setAdminContacts(updated);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    console.log("Contact saved:", newContact);
    console.log("All saved contacts:", updated);
  };

  const handleDelete = (id) => {
    if (storedIds.has(String(id))) {
      // localStorage contact — remove permanently
      const updated = adminContacts.filter((c) => c.id !== id);
      localStorage.setItem("contactsData", JSON.stringify(updated));
      setAdminContacts(updated);
    } else {
      // Static contact — hide from view (frontend-only)
      setHiddenStaticIds((prev) => new Set([...prev, String(id)]));
    }
  };

  return (
    <main className="dashboard-page">

      {/* HERO */}
      <section className="dashboard-hero">
        <div className="admin-shell">

          <div className="hero-copy">
            <span className="eyebrow">Admin Panel</span>
            <h1>Admin Dashboard</h1>
            <p>
              Track monthly platform activity, monitor new parent engagement, and manage trusted contacts.
            </p>
          </div>

          <div className="stats-grid">
            {["Total Visitors","Total Registered Users","Total Contact Listings","New This Month"].map((t,i)=>(
              <div className="stat-card" key={i}>
                <p className="stat-card__label">{t}</p>
                <h2 className="stat-card__value">{["11,130","611","3","221"][i]}</h2>
                <p className="stat-card__meta">Sample data</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* INSIGHTS */}
      <section className="dashboard-section">
        <div className="admin-shell">

          <div className="section-heading">
            <span className="section-kicker">Insights</span>
            <h2>Website analytics overview</h2>
            <p>Monthly sample data is ready for backend or database connection later.</p>
          </div>

          <div className="insights-layout">

            {/* CHART */}
            <div className="panel">
             <div className="panel-head">
  <div>
    <h3>Monthly performance</h3>
    <p className="sub-text">
      Visitors, signups, and inquiries across recent months.
    </p>
  </div>

  <div className="legend">
    <span><i className="dot visitors"></i>Visitors</span>
    <span><i className="dot signups"></i>Signups</span>
    <span><i className="dot inquiries"></i>Inquiries</span>
  </div>
</div>
              <div className="chart-wrap">
  <Line
    data={{
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Visitors",
          data: [1240, 1400, 1650, 1850, 2150, 2400],
          borderColor: "#16227e",
          tension: 0.4
        },
        {
          label: "Signups",
          data: [700, 820, 1000, 1200, 1400, 1600],
          borderColor: "#00a6c8",
          tension: 0.4
        },
        {
          label: "Inquiries",
          data: [620, 700, 950, 1050, 1300, 1450],
          borderColor: "#8b5cf6",
          tension: 0.4
        }
      ]
    }}
    options={{
      responsive: true,
  maintainAspectRatio: false, // 🔥 أهم سطر
  plugins: {
    legend: {
      display: false // إحنا عاملين legend بإيدنا فوق
    }
      },
      scales: {
        y: {
          grid: {
            color: "#e5e7eb"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }}
  />
</div>
            </div>

            {/* RIGHT SIDE */}
            <div className="insights-support">

  {/* Growth snapshot */}
  <div className="panel">
    <h3>Growth snapshot</h3>

    <div className="trend-item">
      <strong>Visitor growth</strong>
      <p>2,480 visitors in Jun</p>
      <span className="trend-pill is-up">+9% from last month</span>
    </div>

    <div className="trend-item">
      <strong>Signup growth</strong>
      <p>139 new users in Jun</p>
      <span className="trend-pill is-up">+11% from last month</span>
    </div>

    <div className="trend-item">
      <strong>Inquiry growth</strong>
      <p>82 parent inquiries this month</p>
      <span className="trend-pill is-up">+11% from last month</span>
    </div>
  </div>

  {/* Recent activity */}
  <div className="panel">
    <div className="panel-head">
      <div>
        <h3>Recent activity</h3>
        <p className="sub-text">
          Latest admin updates and listings added to the dashboard.
        </p>
      </div>
    </div>

    <div className="activity-list">

      <div className="activity-item">
        <strong>Analytics synced</strong>
        <p>Latest dashboard sample data prepared for Jun.</p>
        <span className="date">Moments ago</span>
      </div>

      <div className="activity-item">
        <strong>Private Doctor added</strong>
        <p>Dr. Laila Nabil in Heliopolis is ready for parent access later.</p>
        <span className="date">09 Apr 2026</span>
      </div>

      <div className="activity-item">
        <strong>Private Trainer added</strong>
        <p>Omar Hany in Maadi is ready for parent access later.</p>
        <span className="date">06 Apr 2026</span>
      </div>

      <div className="activity-item">
        <strong>Private Teacher added</strong>
        <p>Mariam Adel in Nasr City is ready for parent access later.</p>
        <span className="date">03 Apr 2026</span>
      </div>

    </div>
  </div>

</div>
          </div>

        </div>
      </section>

      {/* CONTACTS SECTION 🔥 */}
      <section className="dashboard-section dashboard-section--light">
  <div className="admin-shell">

    <div className="section-heading">
      <span className="section-kicker">CONTACTS</span>
      <h2>Manage parent resources</h2>
      <p>
        Add and maintain private teachers, trainers, and doctors in one place.
      </p>
    </div>

    <div className="management-layout">

      {/* LEFT - FORM */}
      <div className="panel form-panel">
        <h3>Add new contact</h3>
        <p className="sub-text">
          New entries are saved locally and prepared for future parent-facing use.
        </p>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-grid">

          <input name="name" value={form.name} onChange={handleField} placeholder="Full Name" />
          <select name="category" value={form.category} onChange={handleField}>
            <option value="">Select category</option>
            <option value="Doctor">Doctor</option>
            <option value="Private Doctor">Private Doctor</option>
            <option value="Therapist">Therapist</option>
            <option value="Private Therapist">Private Therapist</option>
            <option value="Teacher">Teacher</option>
            <option value="Private Teacher">Private Teacher</option>
            <option value="Coach">Coach</option>
            <option value="Private Trainer">Private Trainer</option>
          </select>

          <input name="specialization" value={form.specialization} onChange={handleField} placeholder="Speech therapy, math" />
          <input name="phone" value={form.phone} onChange={handleField} placeholder="0100 000 0000" />

          <input name="email" value={form.email} onChange={handleField} placeholder="name@example.com" />
          <input name="location" value={form.location} onChange={handleField} placeholder="Cairo, Giza, Nasr City..." />

          <input name="availability" value={form.availability} onChange={handleField} placeholder="Ages 4-12, home visit..." />
          <select name="status" value={form.status} onChange={handleField}>
            <option value="Available">Available</option>
            <option value="Active">Active</option>
            <option value="Online">Online</option>
            <option value="Busy">Busy</option>
          </select>

          <input name="budget" value={form.budget} onChange={handleField} placeholder="450 EGP / session" />
          <input name="rating" value={form.rating} onChange={handleField} placeholder="4.8" />

          <div className="photo-upload-field">
            <label className="photo-upload-label">
              <img
                src={photoPreview || "/images/default-profile.svg"}
                alt="Contact photo preview"
                className="photo-upload-preview"
                onError={(e) => { e.currentTarget.src = "/images/default-profile.svg"; }}
              />
              <div className="photo-upload-meta">
                <strong>Photo</strong>
                <span>
                  {photoFile ? photoFile.name : "Click to upload a photo (JPG, PNG, GIF)"}
                </span>
              </div>
              <span className="photo-upload-cta">Browse</span>
              <input type="file" hidden accept="image/*" onChange={handlePhotoSelect} />
            </label>
          </div>

          <textarea name="description" value={form.description} onChange={handleField} className="full" placeholder="Short summary for parents viewing this contact later."></textarea>

        </div>

        <button className="btn-primary" onClick={handleAddContact}>Add Contact</button>
      </div>

      {/* RIGHT - TABLE */}
      <div className="panel list-panel">

        <h3>Existing contacts</h3>
        <p className="sub-text">
          Search, filter, edit, or remove listings before parents browse them.
        </p>

        <div className="filters-row">
          <input placeholder="Search by name..." />
          <select><option>All categories</option></select>
          <select><option>All statuses</option></select>
          <select><option>All cities</option></select>
        </div>

        <div className="table-wrap">
  <table className="contact-table">

    <thead>
      <tr>
        <th>NAME</th>
        <th>CATEGORY</th>
        <th>SPECIALTY</th>
        <th>CONTACT</th>
        <th>AREA</th>
        <th>STATUS</th>
        <th>ACTIONS</th>
      </tr>
    </thead>

    <tbody>
      {allContacts.map((contact) => {
        const displayName     = contact.name || contact.fullName || "Unnamed Contact";
        const displayRating   = contact.review ? `${contact.review} / 5 rating` : contact.reviewLabel || "N/A";
        const displayCategory = contact.category || "Uncategorized";
        const displaySpecialty = contact.specialization || contact.role || "No specialty";

        return (
          <tr key={contact.id}>
            <td>
              <div className="contact-name-cell">
                <img
                  src={
                    contact.image?.startsWith("data:")
                      ? contact.image
                      : contact.image
                        ? `/${contact.image}`
                        : "/images/default-profile.svg"
                  }
                  className="contact-avatar"
                  alt={displayName}
                  onError={(e) => { e.currentTarget.src = "/images/default-profile.svg"; }}
                />
                <div className="contact-name-text">
                  <span className="contact-name">{displayName}</span>
                  <div className="sub">{displayRating}</div>
                </div>
              </div>
            </td>

            <td>{displayCategory}</td>

            <td>
              <strong>{displaySpecialty}</strong>
              {contact.availability && <div className="sub">{contact.availability}</div>}
            </td>

            <td>
              <div>{contact.phone || "—"}</div>
              {contact.email && <div className="sub">{contact.email}</div>}
            </td>

            <td>{contact.location || "—"}</td>

            <td>
              <span className={`status ${contact.status?.toLowerCase() === "available" ? "available" : "busy"}`}>
                {contact.status || "—"}
              </span>
            </td>

            <td className="actions-cell">
              <div className="actions-inner">
                <button className="btn delete" onClick={() => handleDelete(contact.id)}>Delete</button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

      </div>

    </div>
  </div>
</section>

    </main>
  );
  function drawChart() {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 300;

  ctx.strokeStyle = "#16227e";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(20, 200);
  ctx.lineTo(100, 180);
  ctx.lineTo(180, 150);
  ctx.lineTo(260, 120);
  ctx.lineTo(340, 100);
  ctx.lineTo(420, 80);
  ctx.stroke();
}
}