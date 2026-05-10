"use client";

export default function SuccessModal({ title, message, onClose }) {
  return (
    <div className="sm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sm-card" onClick={(e) => e.stopPropagation()}>

        {/* decorative blobs */}
        <span className="sm-blob sm-blob--tl" aria-hidden="true" />
        <span className="sm-blob sm-blob--br" aria-hidden="true" />

        {/* close button */}
        <button className="sm-close" onClick={onClose} aria-label="Close">&#x2715;</button>

        {/* check icon */}
        <div className="sm-icon-ring" aria-hidden="true">
          <div className="sm-icon-inner">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="25" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
              <polyline
                points="14,27 22,35 38,18"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* sparkle dots */}
        <span className="sm-spark sm-spark--1" aria-hidden="true" />
        <span className="sm-spark sm-spark--2" aria-hidden="true" />
        <span className="sm-spark sm-spark--3" aria-hidden="true" />
        <span className="sm-spark sm-spark--4" aria-hidden="true" />

        <h2 className="sm-title">{title}</h2>

        <p className="sm-message">{message}</p>

        <button className="sm-ok-btn" onClick={onClose}>OK</button>

        <p className="sm-footer-note">Confirmations are sent via email.</p>
      </div>
    </div>
  );
}
