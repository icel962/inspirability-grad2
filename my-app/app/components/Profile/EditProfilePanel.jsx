"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "@/app/lib/api";

function getMediaPreviewSrc(media) {
  if (!media) return "";
  if (typeof media === "string") return media;
  if (media.src) return media.src;
  if (media.preview) return media.preview;
  if (media.url) return media.url;
  if (media.dataUrl) return media.dataUrl;
  if (media.file instanceof File) return URL.createObjectURL(media.file);
  return "";
}

function isVideoMedia(media) {
  const type = media?.type || media?.mimeType || "";
  const src = getMediaPreviewSrc(media);
  return (
    type === "video" ||
    type.startsWith("video/") ||
    src.endsWith(".mp4") ||
    src.endsWith(".webm") ||
    src.endsWith(".mov")
  );
}

export default function EditProfilePanel({
  user,
  role,
  formData,
  setFormData,
  onClose,
  setProfile,
  onSaveSuccess,
  mediaKey,
  serviceImage,
  computedMedia,
}) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [imagePreview, setImagePreview] = useState(
    user.image
      ? apiUrl(`/uploads/${user.image}`)
      : serviceImage || "/images/default-profile.svg"
  );
  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState(user.document_upload || "");

  // localMedia = items already saved to localStorage for this provider
  const [localMedia, setLocalMedia] = useState([]);

  const imageRef = useRef();
  const documentRef = useRef();

  useEffect(() => {
    if (!mediaKey) return;
    try {
      const raw = localStorage.getItem(mediaKey);
      setLocalMedia(raw ? JSON.parse(raw) : []);
    } catch {
      setLocalMedia([]);
    }
  }, [mediaKey]);

  console.log("Current profile:", user);
  console.log("Edited profile:", formData);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    console.log("Selected files:", { image: file });
  };

  const handleDocumentSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocumentFile(file);
    setDocumentName(file.name);
    console.log("Selected files:", { document: file });
  };

  const handleDocumentRemove = () => {
    setDocumentFile(null);
    setDocumentName("");
    setFormData({ ...formData, document_upload: "" });
    if (documentRef.current) documentRef.current.value = "";
  };

  const readAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const additions = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 5 MB and was skipped.`);
        continue;
      }
      try {
        const src = await readAsBase64(file);
        additions.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: file.type.startsWith("video") ? "video" : "image",
          name: file.name,
          src,
          uploadedAt: new Date().toISOString(),
        });
      } catch {
        alert(`Failed to read "${file.name}".`);
      }
    }
    if (additions.length > 0) setLocalMedia((prev) => [...prev, ...additions]);
    e.target.value = "";
  };

  const handleMediaDelete = (id) => {
    setLocalMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);
    const token = localStorage.getItem("token");

    try {
      // 1. Upload new profile image if one was selected
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await axios.post(apiUrl("/api/profile/upload-image"), fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setProfile((prev) => ({
          ...prev,
          profile: { ...prev.profile, image: res.data.image },
        }));
      }

      // 2. Save profile fields
      await axios.put(apiUrl("/api/profile/update"), formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 3. Persist localMedia to localStorage so Details page reflects uploads
      if (mediaKey) {
        try {
          localStorage.setItem(mediaKey, JSON.stringify(localMedia));
        } catch {
          console.error("localStorage full — media not saved");
        }
      }

      console.log("Edited profile saved:", formData);

      setSaveStatus("success");
      setTimeout(() => {
        onSaveSuccess();
      }, 900);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Reusable field components ─────────────────────────────────────────────────

  const Field = ({ label, name, type = "text", disabled = false, placeholder }) => (
    <div className="ep-field">
      <label className="ep-label">{label}</label>
      <input
        className={`ep-input${disabled ? " ep-input-disabled" : ""}`}
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder || label}
      />
    </div>
  );

  const TextArea = ({ label, name, placeholder, rows = 3 }) => (
    <div className="ep-field ep-field-full">
      <label className="ep-label">{label}</label>
      <textarea
        className="ep-textarea"
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder || label}
        rows={rows}
      />
    </div>
  );

  const ReadOnlyEmail = ({ value }) => (
    <div className="ep-field">
      <label className="ep-label">Email (read-only)</label>
      <input className="ep-input ep-input-disabled" value={value || ""} disabled />
    </div>
  );

  // ── Role-specific field groups ────────────────────────────────────────────────

  const renderParentFields = () => (
    <>
      <div className="ep-section">
        <h4 className="ep-section-title">Main Info</h4>
        <div className="ep-grid">
          <Field label="Full Name" name="name" placeholder="Your full name" />
          <Field label="City" name="city" />
          <Field label="Government" name="government" placeholder="Governorate" />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Child Info</h4>
        <div className="ep-grid">
          <Field label="Gender" name="gender_child" placeholder="Child's gender" />
          <Field label="Education Level" name="education_level_child" />
          <Field label="Date of Birth" name="DOB_child" type="date" />
        </div>

        <div className="ep-field ep-file-field">
          <label className="ep-label">Document / PDF</label>
          {documentName ? (
            <div className="ep-file-preview">
              <span className="ep-file-icon">📄</span>
              <span className="ep-file-name">{documentName}</span>
              <button
                type="button"
                className="ep-btn ep-btn-replace"
                onClick={() => documentRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                className="ep-btn ep-btn-delete"
                onClick={handleDocumentRemove}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ep-btn ep-btn-upload"
              onClick={() => documentRef.current?.click()}
            >
              + Upload Document
            </button>
          )}
          <input
            type="file"
            ref={documentRef}
            hidden
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleDocumentSelect}
          />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Contact</h4>
        <div className="ep-grid">
          <ReadOnlyEmail value={user.email} />
          <Field label="Phone Number" name="tel_no" placeholder="Phone number" />
        </div>
      </div>
    </>
  );

  const renderSchoolFields = () => (
    <>
      <div className="ep-section">
        <h4 className="ep-section-title">Main Info</h4>
        <div className="ep-grid">
          <Field label="School Name" name="school_name" />
          <Field label="City" name="city" />
          <Field label="Government" name="government" placeholder="Governorate" />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">School Details</h4>
        <div className="ep-grid">
          <Field label="Educational Level" name="educational_level" />
          <Field label="Special Type" name="special_type" />
        </div>
        <TextArea label="Admission Details" name="admission_details" rows={3} />
        <TextArea label="History Info" name="history_info" rows={3} />
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Contact</h4>
        <div className="ep-grid">
          <ReadOnlyEmail value={user.email} />
          <Field label="Phone Number" name="tel_no" placeholder="Phone number" />
        </div>
      </div>
    </>
  );

  const renderSportFields = () => (
    <>
      <div className="ep-section">
        <h4 className="ep-section-title">Main Info</h4>
        <div className="ep-grid">
          <Field label="Center Name" name="sport_center_name" />
          <Field label="Center Type" name="sport_center_type" />
          <Field label="Location" name="location" />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Programs & Details</h4>
        <div className="ep-grid">
          <Field label="Sports Offered" name="sports_type_offered" />
          <Field label="Working Days & Hours" name="working_days_and_hours" />
          <Field label="Age Range" name="age" />
          <Field label="Staff Qualifications" name="staff_qualifications" />
          <Field label="Coach Certifications" name="coach_certifications" />
          <Field label="Session Type" name="private_sessions_or_group" />
          <Field label="Special Coach" name="special_coach_availability" />
          <Field label="Adaptive Equipments" name="adaptive_equipments" />
          <Field label="Supported Conditions" name="supported_conditions" />
          <Field label="Price Min" name="session_price_min" />
          <Field label="Price Max" name="session_price_max" />
        </div>
        <TextArea label="Details" name="details" rows={3} />
        <TextArea label="More Info" name="more_info" rows={3} />
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Contact</h4>
        <div className="ep-grid">
          <Field label="Email" name="email_address" />
          <Field label="Phone" name="phone_number" />
          <Field label="Social Media Links" name="social_media_links" />
        </div>
      </div>
    </>
  );

  const renderClinicFields = () => (
    <>
      <div className="ep-section">
        <h4 className="ep-section-title">Main Info</h4>
        <div className="ep-grid">
          <Field label="Clinic Name" name="clinic_name" />
          <Field label="Clinic Type" name="clinic_type" />
          <Field label="Location" name="location" />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Clinical Details</h4>
        <div className="ep-grid">
          <Field label="Specialization" name="specialization_type" />
          <Field label="Working Hours & Days" name="working_hours_and_days" />
          <Field label="Session Price Range" name="session_price_range" />
        </div>
      </div>

      <div className="ep-section">
        <h4 className="ep-section-title">Contact</h4>
        <div className="ep-grid">
          <Field label="Email" name="email" />
          <Field label="Phone" name="phone_number" />
        </div>
      </div>
    </>
  );

  const renderFields = () => {
    if (role === "parent") return renderParentFields();
    if (role === "school") return renderSchoolFields();
    if (role === "sport") return renderSportFields();
    if (role === "clinic" || role === "medical") return renderClinicFields();
    return null;
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="ep-overlay" onClick={handleOverlayClick}>
      <div className="ep-panel">

        {/* ── Header ── */}
        <div className="ep-header">
          <div>
            <h2 className="ep-title">Edit Profile</h2>
            <p className="ep-subtitle">Update your information below and save when ready.</p>
          </div>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="ep-body">

          {/* Profile Photo */}
          <div className="ep-section ep-photo-section">
            <h4 className="ep-section-title">Profile Photo</h4>
            <div className="ep-photo-row">
              <div className="ep-photo-preview">
                <img src={imagePreview} alt="Profile preview" />
              </div>
              <div className="ep-photo-actions">
                <p className="ep-photo-hint">JPG, PNG or GIF — max 2 MB</p>
                <button
                  type="button"
                  className="ep-btn ep-btn-upload"
                  onClick={() => imageRef.current?.click()}
                >
                  {imageFile ? "Change Photo" : "Upload New Photo"}
                </button>
                {imageFile && (
                  <p className="ep-file-selected">Selected: {imageFile.name}</p>
                )}
                <input
                  type="file"
                  ref={imageRef}
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {renderFields()}

          {/* Media section (providers only) */}
          {mediaKey && (
            <div className="ep-media-section">
              <h4 className="ep-section-title">Service Media</h4>

              <div className="ep-media-grid">
                {/* Computed service images/video (read-only, same as Details page) */}
                {(computedMedia || []).map((item, idx) => {
                  const src = getMediaPreviewSrc(item);
                  if (!src) return null;
                  const isVid = isVideoMedia(item);
                  return (
                    <div className="ep-media-card" key={item._id || `s-${idx}`}>
                      <div className="ep-media-preview">
                        {isVid ? (
                          <video src={src} controls muted playsInline preload="metadata" />
                        ) : (
                          <img
                            src={src}
                            alt={`service-${idx + 1}`}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                        <span className="ep-media-badge">Service</span>
                      </div>
                    </div>
                  );
                })}

                {/* Provider-uploaded items (deleteable) */}
                {localMedia.map((item, idx) => {
                  const src = getMediaPreviewSrc(item);
                  if (!src) return null;
                  const isVid = isVideoMedia(item);
                  return (
                    <div className="ep-media-card" key={item.id || `u-${idx}`}>
                      <div className="ep-media-preview">
                        {isVid ? (
                          <video src={src} controls muted playsInline preload="metadata" />
                        ) : (
                          <img
                            src={src}
                            alt={item.name || `upload-${idx + 1}`}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                        <span className="ep-media-badge ep-media-badge--upload">Uploaded</span>
                      </div>
                      {item.name && <p className="ep-media-name">{item.name}</p>}
                      <button
                        type="button"
                        className="ep-media-delete"
                        onClick={() => handleMediaDelete(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Upload more media */}
              <label className="ep-media-upload-label">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  hidden
                  onChange={handleMediaUpload}
                />
                + Add Media
              </label>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="ep-footer">
          {saveStatus === "success" && (
            <span className="ep-status ep-status-success">✓ Saved successfully</span>
          )}
          {saveStatus === "error" && (
            <span className="ep-status ep-status-error">✗ Failed to save — please try again</span>
          )}
          <div className="ep-footer-btns">
            <button
              className="ep-btn ep-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="ep-btn ep-btn-save"
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
