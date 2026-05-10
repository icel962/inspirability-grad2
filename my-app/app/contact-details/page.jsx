"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { contacts as staticContacts } from "./contacts-data.js";
import "./contact-details.css";

function InfoItem({ label, value, href }) {
  if (!value) return null;

  return (
    <div className="contact-profile-card__item">
      <span className="contact-profile-card__label">{label}</span>
      <div className="contact-profile-card__value">
        {href ? <a href={href}>{value}</a> : value}
      </div>
    </div>
  );
}

function ExtraItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="contact-extra-item">
      <span className="contact-extra-item__label">{label}</span>
      <p className="contact-extra-item__value">{value}</p>
    </div>
  );
}

function ContactNotFound() {
  return (
    <div className="contact-details-empty">
      <h1>Contact not found</h1>
      <p>
        The selected contact could not be loaded. Please return to the contacts
        page and choose a contact again.
      </p>
      <Link className="contact-details-empty__link" href="/contacts">
        Back to contacts
      </Link>
    </div>
  );
}

function ContactDetailsContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("id");

  // Read localStorage synchronously on first render — no flash of "not found"
  const [storedContacts] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("contactsData");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const allContacts = useMemo(() => {
    const merged = [...staticContacts, ...storedContacts];
    console.log("Contact ID from URL:", contactId);
    console.log("Details stored contacts:", storedContacts);
    console.log("Details all contacts:", merged);
    return merged;
  }, [storedContacts, contactId]);

  const contact = allContacts.find(
    (item) => String(item.id) === String(contactId)
  );
  console.log("Matched contact:", contact);

  const fallbackImage = "/images/unnamed.png";

  return (
    <div className="contact-details-page">
      <main className="contact-details-main">
        <section className="contact-details-section">
          <div className="contact-details-shell">
            <nav className="contact-details-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/contacts">Contacts</Link>
              <span aria-hidden="true">/</span>
              <span>{contact?.name || "Details"}</span>
            </nav>

            <div className="contact-details-shell__content" aria-live="polite">
              {!contact ? (
                <ContactNotFound />
              ) : (
                <div className="contact-details-layout">
                  <aside className="contact-profile-card">
                    <Link className="contact-profile-card__back" href="/contacts">
                      &#8592; Back to contacts
                    </Link>

                    <div className="contact-profile-card__avatar">
                      <img
                        src={
                          contact.image?.startsWith("data:")
                            ? contact.image
                            : contact.image
                              ? `/${contact.image}`
                              : fallbackImage
                        }
                        alt={contact.name}
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                      />
                    </div>

                    <h1 className="contact-profile-card__name">{contact.name}</h1>
                    <p className="contact-profile-card__role">{contact.role}</p>

                    <div className="contact-profile-card__badges">
                      <span className="contact-badge contact-badge--status">
                        {contact.status || "Available"}
                      </span>
                      {contact.category && (
                        <span className="contact-badge contact-badge--category">
                          {contact.category}
                        </span>
                      )}
                    </div>

                    <div className="contact-profile-card__list">
                      <InfoItem
                        href={contact.phone ? `tel:${contact.phone}` : ""}
                        label="Phone"
                        value={contact.phone}
                      />
                      <InfoItem
                        href={contact.email ? `mailto:${contact.email}` : ""}
                        label="Email"
                        value={contact.email}
                      />
                      <InfoItem label="Location" value={contact.location} />
                      <InfoItem label="Availability" value={contact.availability} />
                      <InfoItem label="Response" value={contact.contactHours} />
                    </div>
                  </aside>

                  <div className="contact-details-content">
                    <section className="contact-overview-card">
                      <p className="contact-overview-card__eyebrow">
                        Professional profile
                      </p>
                      <h2 className="contact-overview-card__title">{contact.name}</h2>
                      <p className="contact-overview-card__subtitle">
                        {[contact.role, contact.specialization]
                          .filter(Boolean)
                          .join(" | ") || contact.role}
                      </p>

                      <div className="contact-stats">
                        <div className="contact-stat">
                          <span className="contact-stat__label">Budget</span>
                          <span className="contact-stat__value">
                            {contact.budgetValue || contact.budgetLabel || "Not listed"}
                          </span>
                        </div>
                        <div className="contact-stat">
                          <span className="contact-stat__label">Distance</span>
                          <span className="contact-stat__value">
                            {contact.distanceLabel ||
                              (contact.distanceKm ? `${contact.distanceKm} km away` : "Not listed")}
                          </span>
                        </div>
                        <div className="contact-stat">
                          <span className="contact-stat__label">Rating</span>
                          <span className="contact-stat__value">
                            {contact.reviewLabel || contact.review || "Not listed"}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className="contact-about-card">
                      <h3 className="contact-section-title">About</h3>
                      <p className="contact-section-text">
                        {contact.description ||
                          "Contact details are available through the directory."}
                      </p>
                    </section>

                    <section className="contact-extra-card">
                      <h3 className="contact-section-title">Key Details</h3>
                      <div className="contact-extra-grid">
                        <ExtraItem label="Specialization" value={contact.specialization} />
                        <ExtraItem label="Category" value={contact.category} />
                        <ExtraItem
                          label="Budget"
                          value={contact.budgetValue || contact.budgetLabel}
                        />
                        <ExtraItem
                          label="Distance"
                          value={
                            contact.distanceLabel ||
                            (contact.distanceKm ? `${contact.distanceKm} km away` : "")
                          }
                        />
                        <ExtraItem
                          label="Reviews"
                          value={
                            contact.reviewsCount
                              ? `${contact.reviewsCount} verified reviews`
                              : ""
                          }
                        />
                        <ExtraItem label="Status" value={contact.status} />
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ContactDetailsPage() {
  return (
    <Suspense fallback={<div className="contact-details-empty">Loading...</div>}>
      <ContactDetailsContent />
    </Suspense>
  );
}
