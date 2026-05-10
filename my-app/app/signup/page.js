"use client";

import { useState } from "react";
import Image from "next/image";
import "./signup.css";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/app/lib/api";
import MediaUploadSection from "@/app/components/shared/MediaUploadSection";

// ── Shared option lists ────────────────────────────────────────────────────────

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Assiut", "Aswan", "Beheira", "Beni Suef",
  "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Ismailia", "Kafr El Sheikh",
  "Luxor", "Matruh", "Minya", "Monufia", "New Valley", "North Sinai",
  "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag",
  "South Sinai", "Suez",
];

const SPECIAL_SUPPORT_TYPES = [
  "Autism (ASD)", "ADHD", "Down Syndrome", "Dyslexia",
  "Speech & Language Disorders", "Physical Disability",
  "Learning Difficulties", "Cerebral Palsy", "General Special Needs",
  "Inclusive (All)", "None",
];

// ── Field definitions per role ────────────────────────────────────────────────

const roleFields = {
  Parent: [
    { name: "name",                placeholder: "Child Full Name",                        type: "text" },
    { name: "phone",               placeholder: "Phone Number",                           type: "tel" },
    { name: "nationalId",          placeholder: "National ID (14 digits)",                type: "text" },
    { name: "email",               placeholder: "Email Address",                          type: "email" },
    { name: "password",            placeholder: "Password",                               type: "password" },
    { name: "username",            placeholder: "Username",                               type: "text" },
    { name: "government",          placeholder: "Governorate",                            type: "select", options: GOVERNORATES },
    { name: "city",                placeholder: "City / District",                        type: "text" },
    { name: "location",            placeholder: "Full Address",                           type: "text" },
    { name: "preferredLocation",   placeholder: "Preferred Service Area",                 type: "select", options: GOVERNORATES },
    { name: "preferredBudget",     placeholder: "Preferred Monthly Budget (EGP)",         type: "number" },
    { name: "preferredServiceType",placeholder: "Preferred Service Type",                 type: "select",
      options: ["School", "Medical / Therapy Clinic", "Sports Center", "All Services"] },
    { name: "educationalLevel",    placeholder: "Child's Current Educational Level",      type: "select",
      options: ["Nursery / KG", "Primary (Grade 1–6)", "Preparatory (Grade 7–9)", "Secondary (Grade 10–12)"] },
    { name: "dob",                 placeholder: "Child Date of Birth",                    type: "date" },
    { name: "gender",              placeholder: "Child Gender",                           type: "select", options: ["Male", "Female"] },
    { name: "file1",               placeholder: "Upload Document (Optional)",             type: "file" },
    { name: "file2",               placeholder: "Upload Additional Document (Optional)",  type: "file" },
  ],

  School: [
    { name: "name",                    placeholder: "School Name",                            type: "text" },
    { name: "email",                   placeholder: "Email Address",                          type: "email" },
    { name: "password",                placeholder: "Password",                               type: "password" },
    { name: "phone",                   placeholder: "Phone Number",                           type: "tel" },
    { name: "location",                placeholder: "School Address",                         type: "text" },
    { name: "city",                    placeholder: "City / District",                        type: "text" },
    { name: "government",              placeholder: "Governorate",                            type: "select", options: GOVERNORATES },
    { name: "categoryOfSchool",        placeholder: "School Category",                        type: "select",
      options: ["International", "National", "Language School", "Private", "Public",
                "American", "British", "IB", "IG", "Montessori", "Other"] },
    { name: "curriculumType",          placeholder: "Curriculum Type",                        type: "select",
      options: ["Egyptian National", "British (IGCSE / A-Level)", "American (SAT / AP)",
                "IB (International Baccalaureate)", "IG (International GCSE)",
                "French", "German", "STEM", "Montessori", "Other"] },
    { name: "educationalLevel",        placeholder: "Educational Levels Covered",             type: "select",
      options: ["Nursery / KG Only", "Primary Only", "Preparatory Only", "Secondary Only",
                "KG to Primary", "Primary to Secondary", "All Levels"] },
    { name: "specialType",             placeholder: "Special Support Type",                   type: "select", options: SPECIAL_SUPPORT_TYPES },
    { name: "classCapacity",           placeholder: "Class Capacity (students per class)",    type: "number" },
    { name: "registrationFees",        placeholder: "Registration Fees (EGP)",                type: "number" },
    { name: "annualFees",              placeholder: "Annual Fees (EGP)",                      type: "number" },
    { name: "shadowAvailability",      placeholder: "Shadow Teacher Available",               type: "select", options: ["Yes", "No"] },
    { name: "teacherTrainingStatus",   placeholder: "Special Education Teacher Training",     type: "select",
      options: ["Fully Trained", "Partially Trained", "Training In Progress", "Not Available"] },
    { name: "certificationsAvailability", placeholder: "Certifications Available",            type: "select", options: ["Yes", "No"] },
    { name: "admissionDetails",        placeholder: "Admission Requirements & Process",       type: "textarea" },
    { name: "historyInfo",             placeholder: "School Background & History",            type: "textarea" },
    { name: "socialMediaLinks",        placeholder: "Social Media Links (optional)",          type: "text" },
    { name: "website",                 placeholder: "Website URL (optional, https://...)",    type: "text" },
  ],

  Clinic: [
    { name: "name",                    placeholder: "Clinic / Center Name",                   type: "text" },
    { name: "email",                   placeholder: "Email Address",                          type: "email" },
    { name: "password",                placeholder: "Password",                               type: "password" },
    { name: "phone",                   placeholder: "Phone Number",                           type: "tel" },
    { name: "location",                placeholder: "Clinic Address",                         type: "text" },
    { name: "clinicType",              placeholder: "Clinic Type",                            type: "select",
      options: ["Speech Therapy Clinic", "Occupational Therapy Clinic",
                "Physical Therapy Clinic", "Behavioral Therapy (ABA) Center",
                "Psychological & Behavioral Clinic", "Multi-Disciplinary Center",
                "Developmental Pediatrics", "Sensory Integration Center", "Other"] },
    { name: "specializationType",      placeholder: "Primary Specialization",                 type: "select",
      options: SPECIAL_SUPPORT_TYPES },
    { name: "specializedTherapists",   placeholder: "Number of Specialized Therapists",       type: "number" },
    { name: "workingHours",            placeholder: "Working Days & Hours  (e.g. Sat–Thu, 9AM–5PM)", type: "text" },
    { name: "sessionPriceRange",       placeholder: "Session Price Range  (e.g. 300–600 EGP)",       type: "text" },
    { name: "certificationsAvailability", placeholder: "Certified Therapists Available",      type: "select", options: ["Yes", "No"] },
    { name: "slidingEquipments",       placeholder: "Sensory / Sliding Equipment Available",  type: "select", options: ["Yes", "No"] },
  ],

  Sport: [
    { name: "name",                    placeholder: "Sport Center Name",                      type: "text" },
    { name: "email",                   placeholder: "Email Address",                          type: "email" },
    { name: "password",                placeholder: "Password",                               type: "password" },
    { name: "phone",                   placeholder: "Phone Number",                           type: "tel" },
    { name: "location",                placeholder: "Center Address",                         type: "text" },
    { name: "sportCenterType",         placeholder: "Sport Center Type",                      type: "select",
      options: ["Sports Club", "Sports Academy", "Fitness Center / Gym", "Swimming Center",
                "Football Academy", "Tennis Academy", "Martial Arts Center",
                "Multi-Sport Complex", "Adaptive Sports Center", "Other"] },
    { name: "sportsTypeOffered",       placeholder: "Sports Offered",                         type: "select",
      options: ["Football", "Basketball", "Tennis", "Swimming", "Gymnastics",
                "Martial Arts", "Athletics / Track & Field", "Cycling", "Volleyball",
                "Multiple Sports", "Adaptive / Special Needs Sports", "Other"] },
    { name: "workingHours",            placeholder: "Working Days & Hours  (e.g. Sat–Thu, 8AM–9PM)", type: "text" },
    { name: "age",                     placeholder: "Minimum Age Accepted (years)",           type: "number" },
    { name: "sessionPriceMin",         placeholder: "Minimum Session Price (EGP)",            type: "number" },
    { name: "sessionPriceMax",         placeholder: "Maximum Session Price (EGP)",            type: "number" },
    { name: "privateSessions",         placeholder: "Session Format",                         type: "select", options: ["Private", "Group"] },
    { name: "specialCoachAvailability",placeholder: "Special Needs Coach Available",          type: "select", options: ["Yes", "No"] },
    { name: "adaptiveEquipments",      placeholder: "Adaptive / Special Equipment Available", type: "select", options: ["Yes", "No"] },
    { name: "supportedConditions",     placeholder: "Special Conditions Supported  (e.g. Autism, ADHD, Down Syndrome…)", type: "textarea" },
    { name: "staffQualifications",     placeholder: "Staff Qualifications & Credentials",     type: "textarea" },
    { name: "coachCertifications",     placeholder: "Coach Certifications (optional)",        type: "textarea" },
    { name: "description",             placeholder: "Center Description & Services",          type: "textarea" },
    { name: "socialMediaLinks",        placeholder: "Social Media Links (optional)",          type: "text" },
    { name: "moreInfo",                placeholder: "Additional Information (optional)",      type: "textarea" },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Signup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");

  const [formData, setFormData] = useState({
    // Common
    name: "", email: "", password: "", phone: "",
    // Parent
    username: "", nationalId: "", government: "", city: "", location: "",
    preferredLocation: "", preferredBudget: "", preferredServiceType: "",
    educationalLevel: "", dob: "", gender: "",
    file1: null, file2: null,
    // School
    categoryOfSchool: "", curriculumType: "", classCapacity: "",
    registrationFees: "", annualFees: "",
    admissionDetails: "", historyInfo: "",
    shadowAvailability: "", specialType: "", teacherTrainingStatus: "",
    certificationsAvailability: "", socialMediaLinks: "", website: "",
    // Clinic
    clinicType: "", specializedTherapists: "", workingHours: "",
    sessionPriceRange: "", specializationType: "", slidingEquipments: "",
    // Sport
    sportCenterType: "", age: "", staffQualifications: "",
    coachCertifications: "", sportsTypeOffered: "", privateSessions: "",
    specialCoachAvailability: "", adaptiveEquipments: "",
    supportedConditions: "", description: "", moreInfo: "",
    sessionPriceMin: "", sessionPriceMax: "",
  });

  const [errors, setErrors] = useState({});

  // Media uploads — only used for provider roles (School, Clinic, Sport)
  const [mediaFiles, setMediaFiles] = useState({
    logo: [], certificates: [], documents: [], gallery: [], video: [],
  });

  const router = useRouter();

  const roles = [
    { name: "Parent", img: "/images/parent.png" },
    { name: "School", img: "/images/school.png" },
    { name: "Clinic", img: "/images/clinic.png" },
    { name: "Admin",  img: "/images/admin.png" },
    { name: "Sport",  img: "/images/sport.png" },
  ];

  const getFieldGroups = (r) => {
    const fields = roleFields[r] || [];
    const groups = [];
    for (let i = 0; i < fields.length; i += 6) {
      groups.push(fields.slice(i, i + 6));
    }
    return groups;
  };

  const fieldGroups     = getFieldGroups(role);
  const isProviderRole  = ["School", "Clinic", "Sport"].includes(role);
  // Providers get an extra media-upload step between the last data step and the submit step
  const totalSteps      = 1 + fieldGroups.length + (isProviderRole ? 2 : 1);
  const mediaStepIndex  = isProviderRole ? 1 + fieldGroups.length + 1 : -1;
  const today           = new Date().toISOString().split("T")[0];

  const optionalFields = new Set([
    "socialMediaLinks", "website", "description", "moreInfo",
    "file1", "file2", "coachCertifications",
  ]);

  // ── Constraints ──────────────────────────────────────────────────────────────

  const getInputConstraints = (field) => {
    const { name, type } = field;
    const base = { required: !optionalFields.has(name) };

    if (type === "textarea") return base;
    if (name === "email")      return { ...base, maxLength: 120 };
    if (name === "password")   return { ...base, minLength: 8, maxLength: 72 };
    if (name === "phone")      return { ...base, inputMode: "tel", maxLength: 16 };
    if (name === "nationalId") return { ...base, inputMode: "numeric", maxLength: 14 };
    if (name === "username")   return { ...base, minLength: 3, maxLength: 80 };
    if (name === "dob")        return { ...base, max: today };
    if (name === "age")        return { ...base, min: 1, max: 100 };
    if (name === "classCapacity")      return { ...base, min: 1, max: 200 };
    if (name === "specializedTherapists") return { ...base, min: 1, max: 500 };
    if (name === "preferredBudget" || name === "registrationFees" ||
        name === "annualFees" || name === "sessionPriceMin" ||
        name === "sessionPriceMax")    return { ...base, min: 0 };
    if (type === "number") return { ...base, min: 0 };

    return { ...base, minLength: base.required ? 2 : undefined, maxLength: 200 };
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateField = (field, value) => {
    const { name, placeholder, type } = field;
    const isOptional = optionalFields.has(name);
    const textValue  = String(value || "").trim();

    console.log("Field type:", type, "| Field name:", name, "| Value:", value);

    if (type === "file") {
      if (!isOptional && !value) return `${placeholder} is required.`;
      return "";
    }

    if (!textValue) {
      return isOptional ? "" : `${placeholder} is required.`;
    }

    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue)) {
      return "Enter a valid email address.";
    }

    if (name === "password" && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(textValue)) {
      return "Password must be at least 8 characters and include a letter and a number.";
    }

    if (name === "phone") {
      const digits = textValue.replace(/\D/g, "");
      if (!/^\+?[0-9\s\-()]+$/.test(textValue) || digits.length < 8 || digits.length > 15) {
        return "Enter a valid phone number.";
      }
    }

    if (name === "nationalId" && !/^\d{14}$/.test(textValue)) {
      return "National ID must be exactly 14 digits.";
    }

    if (name === "username" && textValue.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (name === "dob") {
      const selected = new Date(textValue);
      if (Number.isNaN(selected.getTime()) || selected > new Date(today)) {
        return "Date of Birth must be a valid past date.";
      }
    }

    if (name === "website" && textValue) {
      try { new URL(textValue); } catch {
        return "Enter a valid URL including https://.";
      }
    }

    if (type === "number" && Number(textValue) < 0) {
      return `${placeholder} cannot be negative.`;
    }

    if (name === "age" && (Number(textValue) < 1 || Number(textValue) > 100)) {
      return "Minimum age must be between 1 and 100.";
    }

    if (name === "sessionPriceMin" || name === "sessionPriceMax") {
      if (Number(textValue) < 0) return "Price cannot be negative.";
    }

    if (type !== "textarea" && type !== "select" && type !== "date" &&
        type !== "number" && textValue.length < 2 && !["age"].includes(name)) {
      return `${placeholder} is too short.`;
    }

    return "";
  };

  const validateFields = (fields) =>
    fields.reduce((acc, field) => {
      const msg = validateField(field, formData[field.name]);
      if (msg) acc[field.name] = msg;
      return acc;
    }, {});

  // ── Event handlers ───────────────────────────────────────────────────────────

  const back = () => setStep((prev) => prev - 1);

  const handleSelect = (r) => {
    if (r === "Admin") {
      alert("Admin cannot signup. Redirecting to login.");
      router.push("/login");
      return;
    }
    setRole(r);
    setTimeout(() => setStep(2), 200);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const nextValue = files ? files[0] : value;

    console.log("Signup form values:", { ...formData, [name]: nextValue });

    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const field = (roleFields[role] || []).find((item) => item.name === name);
      if (field && validateField(field, nextValue)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleNext = () => {
    const currentFields = fieldGroups[step - 2] || [];
    const nextErrors    = validateFields(currentFields);
    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }
    if (step < totalSteps) setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const allFields  = roleFields[role] || [];
      const nextErrors = validateFields(allFields);

      if (Object.keys(nextErrors).length > 0) {
        const badIndex = allFields.findIndex((f) => nextErrors[f.name]);
        setErrors(nextErrors);
        if (badIndex >= 0) setStep(Math.floor(badIndex / 6) + 2);
        return;
      }

      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          dataToSend.append(key, formData[key]);
        }
      });
      dataToSend.append("role", role);

      // ── Append media files for provider roles ─────────────────────────────
      if (isProviderRole) {
        const { logo = [], certificates = [], documents = [], gallery = [], video = [] } = mediaFiles;

        if (logo[0])   dataToSend.append("providerLogo",  logo[0]);
        certificates.forEach((f, i) => dataToSend.append(`certificate_${i}`, f));
        documents.forEach((f, i)    => dataToSend.append(`document_${i}`, f));
        gallery.forEach((f, i)      => dataToSend.append(`gallery_${i}`, f));
        if (video[0])  dataToSend.append("providerVideo", video[0]);

        console.log("Uploaded files:", mediaFiles);
        console.log("Media payload:", {
          logo:         logo.map((f) => f.name),
          certificates: certificates.map((f) => f.name),
          documents:    documents.map((f) => f.name),
          gallery:      gallery.map((f) => f.name),
          video:        video.map((f) => f.name),
        });
      }

      console.log("Provider signup data:", Object.fromEntries(
        [...dataToSend.entries()]
          .filter(([k]) => k !== "password")
          .map(([k, v]) => [k, v instanceof File ? `[File] ${v.name}` : v])
      ));

      const res  = await fetch(apiUrl("/api/signup"), { method: "POST", body: dataToSend });
      const data = await res.json();

      if (!res.ok) return alert(data.message || "Signup failed");

      alert("Signup successful!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Server error. Make sure the backend is running.");
    }
  };

  // ── Field renderer ───────────────────────────────────────────────────────────

  const renderField = (field) => {
    const { name, placeholder, type, options } = field;
    const value       = formData[name] ?? "";
    const error       = errors[name];
    const constraints = getInputConstraints(field);

    if (type === "select") {
      return (
        <div key={name} className={`input-group ${error ? "input-group--error" : ""}`}>
          <label>
            {placeholder}
            {constraints.required && <span className="required-star">*</span>}
          </label>
          <select
            name={name}
            value={value}
            onChange={handleChange}
            required={constraints.required}
            aria-invalid={Boolean(error)}
          >
            <option value="">— Select {placeholder} —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {error && <p className="signup-field-error">{error}</p>}
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div key={name} className={`input-group input-group--full ${error ? "input-group--error" : ""}`}>
          <label>
            {placeholder}
            {constraints.required && <span className="required-star">*</span>}
          </label>
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={constraints.required}
            rows={3}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="signup-field-error">{error}</p>}
        </div>
      );
    }

    if (type === "file") {
      return (
        <div key={name} className={`input-group ${error ? "input-group--error" : ""}`}>
          <label>
            {placeholder}
            {constraints.required && <span className="required-star">*</span>}
          </label>
          <input
            type="file"
            name={name}
            onChange={handleChange}
            required={constraints.required}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="signup-field-error">{error}</p>}
        </div>
      );
    }

    return (
      <div key={name} className={`input-group ${error ? "input-group--error" : ""}`}>
        <label>
          {placeholder}
          {constraints.required && <span className="required-star">*</span>}
        </label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={constraints.required}
          min={constraints.min}
          max={constraints.max}
          minLength={constraints.minLength}
          maxLength={constraints.maxLength}
          inputMode={constraints.inputMode}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="signup-field-error">{error}</p>}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="signup">
      <div className="signup-container">

        {/* LEFT SIDE */}
        <div className="left">
          <h1>Sign-up</h1>
          <p>Follow the steps to save your data</p>

          <div className="steps">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`circle ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`right ${step > 1 && step < totalSteps ? "right--form" : ""}`}>

          {/* STEP 1 — Role selection */}
          {step === 1 && (
            <div className="role-selection">
              <h2>Select Role</h2>
              <div className="roles">
                {roles.map((r) => (
                  <div
                    key={r.name}
                    className={`role-card ${role === r.name ? "selected" : ""}`}
                    onClick={() => handleSelect(r.name)}
                  >
                    <Image src={r.img} alt={r.name} width={100} height={100} />
                    <div className="overlay" />
                    <span className="role-name">{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORM STEPS — data fields */}
          {step > 1 && step < (isProviderRole ? mediaStepIndex : totalSteps) && (
            <div className="form-step">
              <h2>{role} Details — Step {step - 1} of {fieldGroups.length}</h2>

              {fieldGroups[step - 2].map(renderField)}

              <div className="btns">
                <button onClick={back}>Back</button>
                <button onClick={handleNext}>Next</button>
              </div>
            </div>
          )}

          {/* MEDIA STEP — providers only */}
          {isProviderRole && step === mediaStepIndex && (
            <div className="form-step form-step--media">
              <MediaUploadSection
                role={role}
                mediaFiles={mediaFiles}
                onChange={setMediaFiles}
              />
              <div className="btns">
                <button onClick={back}>Back</button>
                <button onClick={handleNext}>Next</button>
              </div>
            </div>
          )}

          {/* SUBMIT STEP */}
          {step === totalSteps && (
            <div className="success-box">
              <div className="check-circle">✓</div>
              <h3 className="subtitle">Data Recorded Successfully</h3>
              <p className="subtitle">Click below to finish</p>
              <button onClick={handleSubmit}>Submit &amp; Go to Login</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
