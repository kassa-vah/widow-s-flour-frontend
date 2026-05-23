// src/components/AdminDashboard/ImageUploader.jsx
//
// Drop-in Cloudinary uploader with:
//   • Click-to-browse file picker
//   • Camera capture (mobile)
//   • Drag-and-drop
//   • Live preview + remove
//   • Upload progress bar
//   • Falls back to URL paste if Cloudinary is not configured
//
// Env vars needed in .env:
//   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
//
// Usage:
//   <ImageUploader
//     value={form.profile_image}          // current URL (string | "")
//     onChange={(url) => setForm({ ...form, profile_image: url })}
//     label="Profile Image"               // optional
//     accept="image/*"                    // optional
//     folder="beneficiaries"              // optional Cloudinary folder
//   />

import { useState, useRef, useCallback } from "react";
import "./ImageUploader.css";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   ?? "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "";

const UPLOAD_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  : null;

export default function ImageUploader({
  value    = "",
  onChange,
  label    = "Image",
  accept   = "image/*",
  folder   = "uploads",
}) {
  const [dragging,   setDragging]   = useState(false);
  const [progress,   setProgress]   = useState(null);   // 0-100 | null
  const [error,      setError]      = useState("");
  const [urlMode,    setUrlMode]    = useState(false);
  const [urlInput,   setUrlInput]   = useState(value || "");

  const fileRef   = useRef(null);
  const cameraRef = useRef(null);

  // ── upload a File object to Cloudinary ───────────────────────────────────
  const uploadFile = useCallback(async (file) => {
    if (!UPLOAD_URL) {
      setError("Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file, or paste a URL below.");
      setUrlMode(true);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    setError("");
    setProgress(0);

    const fd = new FormData();
    fd.append("file",           file);
    fd.append("upload_preset",  UPLOAD_PRESET);
    fd.append("folder",         folder);

    // XMLHttpRequest gives us progress events
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 90)); // cap at 90 until response
      }
    };

    xhr.onload = () => {
      setProgress(null);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          onChange(data.secure_url);
          setUrlInput(data.secure_url);
        } else {
          setError(data.error?.message ?? "Upload failed. Check your Cloudinary preset is unsigned.");
        }
      } catch {
        setError("Unexpected response from Cloudinary.");
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setError("Network error during upload.");
    };

    xhr.send(fd);
  }, [folder, onChange]);

  // ── drag handlers ────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const onFileChange   = (e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); };
  const onCameraChange = (e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    setError("");
    if (fileRef.current)   fileRef.current.value   = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const handleUrlSave = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setError("Please enter a URL."); return; }
    onChange(trimmed);
    setError("");
    setUrlMode(false);
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="iu-root">
      {label && <p className="iu-label">{label}</p>}

      {/* ── preview (when a URL exists) ── */}
      {value && !urlMode && (
        <div className="iu-preview">
          <img
            src={value}
            alt="Preview"
            className="iu-preview__img"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="iu-preview__overlay">
            <button className="iu-preview__btn" onClick={() => fileRef.current?.click()} title="Replace">
              <i className="bi bi-arrow-repeat" /> Replace
            </button>
            <button className="iu-preview__btn iu-preview__btn--danger" onClick={handleRemove} title="Remove">
              <i className="bi bi-trash" /> Remove
            </button>
          </div>
        </div>
      )}

      {/* ── drop zone (when no image) ── */}
      {!value && !urlMode && (
        <div
          className={`iu-dropzone ${dragging ? "iu-dropzone--drag" : ""} ${progress !== null ? "iu-dropzone--uploading" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => progress === null && fileRef.current?.click()}
        >
          {progress !== null ? (
            <div className="iu-progress">
              <div className="iu-progress__bar" style={{ width: `${progress}%` }} />
              <span className="iu-progress__label">Uploading… {progress}%</span>
            </div>
          ) : (
            <>
              <div className="iu-dropzone__icon">
                <i className="bi bi-cloud-arrow-up" />
              </div>
              <p className="iu-dropzone__primary">
                {dragging ? "Drop to upload" : "Drop an image or click to browse"}
              </p>
              <p className="iu-dropzone__secondary">PNG, JPG, WEBP · max 10 MB</p>

              <div className="iu-dropzone__actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="iu-btn iu-btn--primary"
                  onClick={() => fileRef.current?.click()}
                >
                  <i className="bi bi-folder2-open" /> Browse
                </button>
                <button
                  type="button"
                  className="iu-btn iu-btn--secondary"
                  onClick={() => cameraRef.current?.click()}
                >
                  <i className="bi bi-camera" /> Camera
                </button>
                <button
                  type="button"
                  className="iu-btn iu-btn--ghost"
                  onClick={() => { setUrlMode(true); setError(""); }}
                >
                  <i className="bi bi-link-45deg" /> Paste URL
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── URL paste mode ── */}
      {urlMode && (
        <div className="iu-url-mode">
          <div className="iu-url-mode__row">
            <input
              className="iu-url-mode__input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              onKeyDown={(e) => e.key === "Enter" && handleUrlSave()}
              autoFocus
            />
            <button type="button" className="iu-btn iu-btn--primary" onClick={handleUrlSave}>
              Use
            </button>
            <button type="button" className="iu-btn iu-btn--ghost" onClick={() => { setUrlMode(false); setError(""); }}>
              <i className="bi bi-x" />
            </button>
          </div>
          {urlInput && (
            <img
              src={urlInput}
              alt="URL preview"
              className="iu-url-mode__preview"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
      )}

      {/* ── error ── */}
      {error && <p className="iu-error"><i className="bi bi-exclamation-circle" /> {error}</p>}

      {/* ── hidden inputs ── */}
      <input ref={fileRef}   type="file" accept={accept}         style={{ display: "none" }} onChange={onFileChange}   />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onCameraChange} />
    </div>
  );
}