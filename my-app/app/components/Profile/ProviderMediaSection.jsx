"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ProviderMediaSection({ mediaKey }) {
  const [media, setMedia] = useState([]);
  const uploadRef = useRef(null);

  // Load from localStorage on mount / key change
  useEffect(() => {
    if (!mediaKey) return;
    try {
      const stored = JSON.parse(localStorage.getItem(mediaKey) || "[]");
      const items = Array.isArray(stored) ? stored : [];
      console.log("Service provider media:", items);
      setMedia(items);
    } catch {
      setMedia([]);
    }
  }, [mediaKey]);

  const persist = (updated) => {
    if (!mediaKey) return;
    try {
      localStorage.setItem(mediaKey, JSON.stringify(updated));
    } catch {
      alert("Storage limit reached. Try deleting some media first.");
      return;
    }
    setMedia(updated);
    console.log("Uploaded files:", updated);
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const additions = [];

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        alert(`"${file.name}" exceeds 5 MB and was skipped.`);
        continue;
      }
      try {
        const src = await readFileAsBase64(file);
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

    if (additions.length > 0) persist([...media, ...additions]);
    e.target.value = "";
  };

  const handleDelete = (id) => {
    persist(media.filter((item) => item.id !== id));
  };

  const handleReplace = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      alert(`"${file.name}" exceeds 5 MB.`);
      e.target.value = "";
      return;
    }
    try {
      const src = await readFileAsBase64(file);
      persist(
        media.map((item) =>
          item.id === id
            ? {
                ...item,
                type: file.type.startsWith("video") ? "video" : "image",
                name: file.name,
                src,
                uploadedAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch {
      alert(`Failed to read "${file.name}".`);
    }
    e.target.value = "";
  };

  if (!mediaKey) return null;

  return (
    <div className="provider-media-section">
      <div className="provider-media-header">
        <h3>My Services Media</h3>
        <p>
          Images and videos you upload here appear on your public profile page.
        </p>
      </div>

      {/* Upload drop zone */}
      <div
        className="provider-media-upload"
        onClick={() => uploadRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && uploadRef.current?.click()}
      >
        <input
          ref={uploadRef}
          type="file"
          multiple
          accept="image/*,video/*"
          hidden
          onChange={handleUpload}
        />
        <span className="provider-media-upload__icon">+</span>
        <span className="provider-media-upload__label">
          Upload Images or Videos
        </span>
        <span className="provider-media-upload__hint">
          Max 5 MB per file · JPG, PNG, GIF, MP4, WebM
        </span>
      </div>

      {/* Uploaded count indicator — grid is visible on public service pages, not here */}
      {media.length > 0 && (
        <p className="provider-media-empty">
          {media.length} file{media.length !== 1 ? "s" : ""} uploaded — visible on your public profile page.
        </p>
      )}
    </div>
  );
}
