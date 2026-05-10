"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "./MediaUploadSection.css";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_MB = 10;

const SECTIONS = {
  School: [
    {
      id: "logo",
      label: "School Logo",
      hint: "Main logo shown on your profile · JPG or PNG, max 10 MB",
      accept: "image/jpeg,image/png,image/webp",
      multiple: false,
      icon: "🏫",
    },
    {
      id: "certificates",
      label: "Accreditation & Certificates",
      hint: "School accreditation, awards, licenses · PDF or image",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📜",
    },
    {
      id: "documents",
      label: "Registration Documents",
      hint: "Ministry registration, official permits · PDF or image",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📄",
    },
    {
      id: "gallery",
      label: "Campus / Facility Photos",
      hint: "Classrooms, grounds, sports areas · JPG or PNG",
      accept: "image/jpeg,image/png,image/webp",
      multiple: true,
      icon: "🏛️",
    },
    {
      id: "video",
      label: "School Tour Video (Optional)",
      hint: "Short intro video for parents · MP4, max 10 MB",
      accept: "video/mp4,video/webm",
      multiple: false,
      icon: "🎥",
    },
  ],

  Clinic: [
    {
      id: "logo",
      label: "Clinic Logo / Profile Image",
      hint: "Main logo or professional photo · JPG or PNG, max 10 MB",
      accept: "image/jpeg,image/png,image/webp",
      multiple: false,
      icon: "🏥",
    },
    {
      id: "certificates",
      label: "Therapist Certificates",
      hint: "Therapy licenses, professional certifications · PDF or image",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📜",
    },
    {
      id: "documents",
      label: "Registration & Licenses",
      hint: "Ministry health license, official operating permits",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📄",
    },
    {
      id: "gallery",
      label: "Clinic Photos",
      hint: "Therapy rooms, equipment, team photos · JPG or PNG",
      accept: "image/jpeg,image/png,image/webp",
      multiple: true,
      icon: "🖼️",
    },
    {
      id: "video",
      label: "Intro Video (Optional)",
      hint: "Short overview of your services · MP4, max 10 MB",
      accept: "video/mp4,video/webm",
      multiple: false,
      icon: "🎥",
    },
  ],

  Sport: [
    {
      id: "logo",
      label: "Center Logo",
      hint: "Main logo shown on your profile · JPG or PNG, max 10 MB",
      accept: "image/jpeg,image/png,image/webp",
      multiple: false,
      icon: "⚽",
    },
    {
      id: "certificates",
      label: "Coach Certifications",
      hint: "Coaching licenses, federation awards · PDF or image",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📜",
    },
    {
      id: "documents",
      label: "Facility Documents",
      hint: "Official permits, registration, safety certificates",
      accept: "image/jpeg,image/png,image/webp,application/pdf",
      multiple: true,
      icon: "📄",
    },
    {
      id: "gallery",
      label: "Facility Photos",
      hint: "Courts, pools, training areas · JPG or PNG",
      accept: "image/jpeg,image/png,image/webp",
      multiple: true,
      icon: "🏟️",
    },
    {
      id: "video",
      label: "Facility Tour Video (Optional)",
      hint: "Short video showcasing your center · MP4, max 10 MB",
      accept: "video/mp4,video/webm",
      multiple: false,
      icon: "🎥",
    },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file, accept) {
  return accept.split(",").map(s => s.trim()).some(pat => {
    if (pat.endsWith("/*")) return file.type.startsWith(pat.slice(0, -1));
    return file.type === pat;
  });
}

// ── FileCard ─────────────────────────────────────────────────────────────────

function FileCard({ file, previewUrl, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPDF   = file.type === "application/pdf";

  return (
    <div className="mu-file-card">
      <div className="mu-thumb">
        {isImage && previewUrl
          ? <img src={previewUrl} alt={file.name} />
          : <span className="mu-thumb-icon">{isVideo ? "🎥" : isPDF ? "📄" : "📁"}</span>
        }
      </div>
      <div className="mu-meta">
        <span className="mu-fname" title={file.name}>{file.name}</span>
        <span className="mu-fsize">{fmtBytes(file.size)}</span>
      </div>
      <button
        type="button"
        className="mu-remove"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        ✕
      </button>
    </div>
  );
}

// ── SectionZone ───────────────────────────────────────────────────────────────

function SectionZone({ section, files, previewUrls, onAdd, onRemove }) {
  const inputRef   = useRef(null);
  const [over, setOver] = useState(false);

  const validate = (file) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
      return false;
    }
    if (!matchesAccept(file, section.accept)) {
      alert(`"${file.name}" is not a supported file type for "${section.label}".`);
      return false;
    }
    return true;
  };

  const process = (incoming) => {
    const valid = Array.from(incoming).filter(validate);
    if (valid.length) onAdd(section.id, valid, section.multiple);
  };

  const onDrop      = (e) => { e.preventDefault(); setOver(false); process(e.dataTransfer.files); };
  const onDragOver  = (e) => { e.preventDefault(); setOver(true); };
  const onDragLeave = ()  => setOver(false);
  const onInputChange = (e) => { process(e.target.files); e.target.value = ""; };

  const hasFiles = files.length > 0;
  const dzLabel  = hasFiles && section.multiple
    ? "Add more files"
    : hasFiles
    ? "Click or drop to replace"
    : "Click or drag & drop to upload";

  return (
    <div className="mu-section">
      {/* Header */}
      <div className="mu-section-hd">
        <span className="mu-section-icon">{section.icon}</span>
        <div className="mu-section-text">
          <p className="mu-section-label">{section.label}</p>
          <p className="mu-section-hint">{section.hint}</p>
        </div>
      </div>

      {/* Uploaded file list */}
      {hasFiles && (
        <div className="mu-file-list">
          {files.map((f, i) => (
            <FileCard
              key={`${f.name}-${f.size}-${i}`}
              file={f}
              previewUrl={previewUrls[i] ?? null}
              onRemove={() => onRemove(section.id, i)}
            />
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`mu-dz${over ? " mu-dz--over" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <span className="mu-dz-arrow">↑</span>
        <p className="mu-dz-label">{dzLabel}</p>
        <p className="mu-dz-types">
          {section.accept.replace(/image\//g, "").replace(/application\//g, "").replace(/video\//g, "").toUpperCase().replace(/,/g, " · ")}
        </p>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={section.multiple}
          accept={section.accept}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MediaUploadSection({ role, mediaFiles, onChange }) {
  const sections = SECTIONS[role] || SECTIONS.School;

  // Preview object URLs — live only as long as the component is mounted
  const [previews, setPreviews] = useState(() => ({
    logo: [], certificates: [], documents: [], gallery: [], video: [],
  }));

  // Regenerate blob URLs when component mounts (in case user navigated back/forward)
  useEffect(() => {
    const blobMap = {};
    Object.entries(mediaFiles).forEach(([key, files]) => {
      blobMap[key] = (files || []).map((f) =>
        f instanceof File && f.type.startsWith("image/")
          ? URL.createObjectURL(f)
          : null
      );
    });
    setPreviews(blobMap);

    return () => {
      Object.values(blobMap).flat().forEach((url) => url && URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add files ──────────────────────────────────────────────────────────────
  const handleAdd = useCallback((sectionId, incoming, multiple) => {
    const newUrls = incoming.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );

    let updatedFiles;
    let updatedPreviews;

    if (multiple) {
      updatedFiles    = [...(mediaFiles[sectionId] || []), ...incoming];
      updatedPreviews = [...(previews[sectionId]   || []), ...newUrls];
    } else {
      // Revoke old URL before replacing
      (previews[sectionId] || []).forEach((url) => url && URL.revokeObjectURL(url));
      updatedFiles    = [incoming[0]];
      updatedPreviews = [newUrls[0]];
    }

    const nextMedia = { ...mediaFiles, [sectionId]: updatedFiles };

    console.log("Uploaded files:", nextMedia);
    console.log("Media payload:", Object.fromEntries(
      Object.entries(nextMedia).map(([k, v]) => [k, (v || []).map((f) => f.name)])
    ));

    onChange(nextMedia);
    setPreviews((prev) => ({ ...prev, [sectionId]: updatedPreviews }));
  }, [mediaFiles, previews, onChange]);

  // ── Remove file ────────────────────────────────────────────────────────────
  const handleRemove = useCallback((sectionId, index) => {
    const url = (previews[sectionId] || [])[index];
    if (url) URL.revokeObjectURL(url);

    const nextFiles    = (mediaFiles[sectionId] || []).filter((_, i) => i !== index);
    const nextPreviews = (previews[sectionId]   || []).filter((_, i) => i !== index);

    onChange({ ...mediaFiles, [sectionId]: nextFiles });
    setPreviews((prev) => ({ ...prev, [sectionId]: nextPreviews }));
  }, [mediaFiles, previews, onChange]);

  const totalCount = Object.values(mediaFiles).reduce(
    (sum, arr) => sum + (arr?.length || 0), 0
  );

  return (
    <div className="mu-wrap">
      <h3 className="mu-heading">Upload Media & Documents</h3>
      <p className="mu-subheading">
        Upload your logo, certificates, and facility photos. All uploads are optional
        and can be updated any time from your profile.
      </p>

      {totalCount > 0 && (
        <div className="mu-count-badge">
          ✓ {totalCount} file{totalCount !== 1 ? "s" : ""} selected
        </div>
      )}

      <div className="mu-sections">
        {sections.map((section) => (
          <SectionZone
            key={section.id}
            section={section}
            files={mediaFiles[section.id] || []}
            previewUrls={previews[section.id] || []}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
