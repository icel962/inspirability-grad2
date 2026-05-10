"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/app/lib/api";
import "../../styles/profile-details.css";

const isPresent = (value) => {
  if (value == null) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && trimmed.toLowerCase() !== "n/a" && trimmed.toLowerCase() !== "null";
  }
  return true;
};

const joinValues = (...values) => values.filter(isPresent).join(" ");
const SAMPLE_GALLERY_VIDEO = "/images/GRAD.mp4";

const formatValue = (value) => {
  if (Array.isArray(value)) return value.filter(isPresent).join(", ");
  if (typeof value === "boolean") return value ? "Available" : "Not available";
  if (value === 1) return "Available";
  if (value === 0) return "Not available";
  return String(value);
};

const addField = (fields, label, value, wide = false) => {
  if (!isPresent(value)) return;
  fields.push({ label, value: formatValue(value), wide });
};

const getMaxNumberFromText = (value) => {
  const matches = String(value || "").match(/\d+(?:\.\d+)?/g);
  if (!matches) return null;
  return Math.max(...matches.map(Number));
};

const getNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const firstNumber = (...values) => {
  for (const value of values) {
    if (typeof value === "string") {
      const textNumber = getMaxNumberFromText(value);
      if (textNumber != null) return textNumber;
    }

    const directNumber = getNumber(value);
    if (directNumber != null) return directNumber;
  }

  return null;
};

const normalizeUrl = (value) => {
  if (!isPresent(value)) return "";
  const text = String(value).trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (/^www\./i.test(text)) return `https://${text}`;
  return "";
};

const findSocialUrl = (value, platform) => {
  const text = String(value || "");
  const urls = text.match(/https?:\/\/[^\s,]+|www\.[^\s,]+/gi) || [];
  const match = urls.find((url) => url.toLowerCase().includes(platform));
  return normalizeUrl(match);
};

const getDigits = (value) => String(value || "").replace(/\D/g, "");

const getContactActions = (kind, item, details) => {
  const phone = item.phone_number || item.tel_no || item.phone;
  const email = item.email_address || item.email;
  const social = item.social_media_links;
  const name = encodeURIComponent(details.name || configByKind[kind]?.label || "Inspirability");
  const phoneDigits = getDigits(phone);
  const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}` : "";
  const facebookHref =
    findSocialUrl(social, "facebook") || `https://www.facebook.com/search/top?q=${name}`;
  const instagramHref =
    findSocialUrl(social, "instagram") || `https://www.instagram.com/explore/search/keyword/?q=${name}`;

  return {
    whatsappHref,
    facebookHref,
    instagramHref,
    callHref: phoneDigits ? `tel:${phoneDigits}` : "",
    emailHref: isPresent(email) ? `mailto:${email}` : "",
  };
};

const getSchoolImage = (item) => {
  const label = joinValues(item.school_name, item.special_type, item.category_of_school).toLowerCase();
  if (item.school_image) return item.school_image;
  if (label.includes("hope")) return "/images/621c175954c1fe4ab610f948_hope-logo.png";
  if (label.includes("canadian") || label.includes("csc")) return "/images/csc-campus-view.jpg";
  return "/images/School.png";
};

const getMedicalImage = (item) => {
  const label = joinValues(item.clinic_name, item.clinic_type, item.specialization_type).toLowerCase();
  if (label.includes("doctor") || label.includes("specialist")) return "/images/profile.png";
  return "/images/Clinic.png";
};

const getSportImage = (item) => {
  const label = joinValues(item.sport_center_name, item.sport_center_type).toLowerCase();
  if (label.includes("ahly")) return "/images/Al_Ahly_SC_logo.svg.png";
  if (label.includes("zamalek")) return "/images/zamalek.png";
  if (label.includes("wadi") || label.includes("degla")) return "/images/Wadi Debla.jpg";
  return "/images/Egytennis-el-Ahly-nasrcity-courts-02.png";
};

const normalizeImagePath = (value) => {
  if (!isPresent(value)) return "";
  const text = String(value).trim();
  if (/^https?:\/\//i.test(text) || text.startsWith("/")) return text;
  return `/images/${text.replace(/^images[\\/]/i, "")}`;
};

const imageCandidates = (...values) =>
  values
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      return String(value || "").split(/[,;|]/);
    })
    .map(normalizeImagePath)
    .filter(Boolean);

const uniqueImages = (images) => [...new Set(images.filter(Boolean))];

const getGalleryImages = (kind, item, details) => {
  const uploadedImages = imageCandidates(
    item.images,
    item.photos,
    item.gallery,
    item.gallery_images,
    item.image,
    item.profile_photo,
    item.school_image,
    item.clinic_image,
    item.sport_center_image,
    item.logo
  );

  const label = joinValues(details.name, details.type).toLowerCase();
  let fallbackImages = [];

  if (kind === "sport") {
    if (label.includes("ahly")) {
      fallbackImages = [
        "/images/Al_Ahly_SC_logo.svg.png",
        "/images/Al-Ahly-SC-1500x1000.jpg",
        "/images/Egytennis-el-Ahly-nasrcity-courts-02.png",
      ];
    } else if (label.includes("zamalek")) {
      fallbackImages = [
        "/images/zamalek.png",
        "/images/Banner-6.jpg",
        "/images/Artboard-28.png",
      ];
    } else if (label.includes("wadi") || label.includes("degla")) {
      fallbackImages = [
        "/images/Wadi Debla.jpg",
        "/images/Banner-6.jpg",
        "/images/747.png",
      ];
    } else {
      fallbackImages = [
        details.image,
        "/images/Egytennis-el-Ahly-nasrcity-courts-02.png",
        "/images/csc-campus-view.jpg",
        "/images/Banner-6.jpg",
      ];
    }
  } else if (kind === "school") {
    fallbackImages = [
      details.image,
      "/images/School.png",
      "/images/csc-campus-view.jpg",
      "/images/home 1.png",
    ];
  } else {
    fallbackImages = [
      details.image,
      "/images/Clinic.png",
      "/images/profile.png",
      "/images/ImageHandler.png",
    ];
  }

  return uniqueImages([...uploadedImages, ...fallbackImages]).slice(0, 5);
};

const normalizeDetails = (kind, item) => {
  const fields = [];

  if (kind === "school") {
    const price = firstNumber(item.budget, item.price, item.fee, item.cost, item.annual_fees, item.registration_fees);
    addField(fields, "Location", item.location || item.city || item.government);
    addField(fields, "Phone", item.phone_number || item.tel_no);
    addField(fields, "Email", item.email);
    addField(fields, "Diagnoses", item.special_type);
    addField(fields, "Age Group", item.educational_level);
    addField(fields, "Rating / Review", item.rating || item.review || item.reviews || item.stars || item.average_rating);
    addField(fields, "Distance", item.distance || item.distanceKm || item.distance_km || item.km);
    addField(fields, "Budget / Price", price != null ? `EGP ${price}` : null);
    addField(fields, "Category", item.category_of_school);
    addField(fields, "Curriculum", item.curriculum_type);
    addField(fields, "Class Capacity", item.class_capacity);
    addField(fields, "Registration Fees", item.registration_fees ? `EGP ${item.registration_fees}` : null);
    addField(fields, "Annual Fees", item.annual_fees ? `EGP ${item.annual_fees}` : null);
    addField(fields, "Admission Details", item.admission_details, true);
    addField(fields, "History", item.history_info, true);
    addField(fields, "Teacher Training", item.teacher_training_status, true);
    addField(fields, "Shadow Availability", item.shadow_availability);
    addField(fields, "Certifications", item.certifications_availability);

    return {
      name: item.school_name,
      type: item.special_type || item.curriculum_type || item.category_of_school,
      image: getSchoolImage(item),
      fields,
    };
  }

  if (kind === "medical") {
    const price = firstNumber(
      item.budget,
      item.price,
      item.fee,
      item.cost,
      item.sessionPrice,
      item.session_price,
      item.session_price_range
    );
    addField(fields, "Location", item.location);
    addField(fields, "Phone", item.phone_number);
    addField(fields, "Email", item.email);
    addField(fields, "Diagnoses", joinValues(item.specialization_type, item.clinic_type));
    addField(fields, "Age Group", item.ageGroup || item.age_group || item.ageGroups);
    addField(fields, "Rating / Review", item.rating || item.review || item.reviews || item.stars);
    addField(fields, "Distance", item.distance || item.distanceKm || item.distance_km || item.km);
    addField(fields, "Budget / Price", price != null ? `EGP ${price}` : null);
    addField(fields, "Working Hours", item.working_hours_and_days);
    addField(fields, "Specialized Therapists", item.specialized_therapists);
    addField(fields, "Session Price Range", item.session_price_range);
    addField(fields, "Certifications", item.certifications_availability);
    addField(fields, "Sliding Equipment", item.sliding_equipments);
    addField(fields, "Description", joinValues(item.clinic_type, item.specialization_type), true);

    return {
      name: item.clinic_name,
      type: item.specialization_type || item.clinic_type,
      image: getMedicalImage(item),
      fields,
    };
  }

  const priceMin = firstNumber(item.session_price_min);
  const priceMax = firstNumber(item.session_price_max);
  const priceText =
    priceMin != null && priceMax != null
      ? `EGP ${priceMin} - ${priceMax}`
      : firstNumber(item.budget, item.price, item.fee, item.cost);

  addField(fields, "Location", item.location);
  addField(fields, "Phone", item.phone_number);
  addField(fields, "Email", item.email_address);
  addField(fields, "Diagnoses", item.supported_conditions);
  addField(fields, "Age Group", item.age);
  addField(fields, "Rating / Review", item.rating || item.review || item.reviews || item.stars);
  addField(fields, "Distance", item.distance || item.distanceKm || item.distance_km || item.km);
  addField(fields, "Budget / Price", typeof priceText === "number" ? `EGP ${priceText}` : priceText);
  addField(fields, "Working Days / Hours", item.working_days_and_hours);
  addField(fields, "Sports Offered", item.sports_type_offered);
  addField(fields, "Session Type", item.private_sessions_or_group);
  addField(fields, "Staff Qualifications", item.staff_qualifications, true);
  addField(fields, "Coach Certifications", item.coach_certifications, true);
  addField(fields, "Special Coach Availability", item.special_coach_availability);
  addField(fields, "Adaptive Equipment", item.adaptive_equipments);
  addField(fields, "Social Media", item.social_media_links);
  addField(fields, "Description", item.details || item.more_info, true);

  return {
    name: item.sport_center_name,
    type: item.sport_center_type,
    image: getSportImage(item),
    fields,
  };
};

const configByKind = {
  school: { apiPath: "/api/schools", label: "School" },
  medical: { apiPath: "/api/medical", label: "Medical" },
  sport: { apiPath: "/api/sport-centers", label: "Sport" },
};

export default function ProfileDetailsPage({ kind, id }) {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [localMedia, setLocalMedia] = useState([]);
  const config = configByKind[kind];

  // Load provider-uploaded media from localStorage (synced with Profile page)
  useEffect(() => {
    if (!kind || !id) return;
    try {
      const key = `providerMedia_${kind}_${id}`;
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      setLocalMedia(Array.isArray(stored) ? stored : []);
    } catch {
      setLocalMedia([]);
    }
  }, [kind, id]);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setNotFound(false);

        const response = await fetch(apiUrl(`${config.apiPath}/${id}`));
        if (!response.ok) {
          setNotFound(true);
          return;
        }

        const record = await response.json();
        setItem(record);
      } catch (error) {
        console.error("Failed to load details:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (id && config) loadDetails();
  }, [config, id]);

  const details = useMemo(() => (item ? normalizeDetails(kind, item) : null), [item, kind]);
  const contactActions = useMemo(
    () => (item && details ? getContactActions(kind, item, details) : null),
    [details, item, kind]
  );
  const galleryImages = useMemo(() => {
    const dbImages = item && details ? getGalleryImages(kind, item, details) : [];
    const localImageSrcs = localMedia
      .filter((m) => m.type === "image")
      .map((m) => m.src);
    return uniqueImages([...localImageSrcs, ...dbImages]);
  }, [details, item, kind, localMedia]);

  const localVideos = useMemo(
    () => localMedia.filter((m) => m.type === "video"),
    [localMedia]
  );

  const visibleGalleryImages = galleryImages.slice(0, 4);

  if (loading) {
    return (
      <section className="profile-details-page">
        <div className="profile-details-empty">
          <h1>Loading details...</h1>
        </div>
      </section>
    );
  }

  if (notFound || !details) {
    return (
      <section className="profile-details-page">
        <div className="profile-details-empty">
          <h1>Details not found</h1>
          <p>The selected {config?.label?.toLowerCase() || "profile"} could not be loaded.</p>
          <button className="profile-details-back" type="button" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </section>
    );
  }

  const appointmentHref = `/appointment?type=${kind}&id=${id}&name=${encodeURIComponent(details.name || "")}`;

  return (
    <section className="profile-details-page">
      <div className="profile-details-shell">
        <button className="profile-details-back" type="button" onClick={() => router.back()}>
          Back
        </button>

        <article className="profile-details-card">
          <div className="profile-details-hero">
            <div className="profile-details-image-wrap">
              <img
                className="profile-details-image"
                src={details.image || "/images/default-profile.svg"}
                alt={details.name || "Profile image"}
                onError={(event) => {
                  event.currentTarget.src = "/images/default-profile.svg";
                }}
              />
            </div>

            <div className="profile-details-title">
              <h1>{details.name || "Untitled profile"}</h1>
              <p>{details.type || config.label}</p>
            </div>
          </div>

          <div className="profile-details-content">
            <div className="profile-details-main">
              <div className="profile-details-grid">
                {details.fields.map((field) => (
                  <div
                    className={`profile-details-item ${field.wide ? "profile-details-wide" : ""}`}
                    key={field.label}
                  >
                    <span className="profile-details-label">{field.label}</span>
                    <div className="profile-details-value">{field.value}</div>
                  </div>
                ))}
              </div>

              <aside className="profile-contact-panel">
                <h2>{details.name || config.label} contact media</h2>

                <Link className="profile-appointment-button" href={appointmentHref}>
                  Make an Appointment
                </Link>

                <div className="profile-contact-actions">
                  {contactActions?.whatsappHref && (
                    <a className="profile-contact-button profile-contact-whatsapp" href={contactActions.whatsappHref} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                  <a className="profile-contact-button profile-contact-facebook" href={contactActions?.facebookHref} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                  {contactActions?.callHref && (
                    <a className="profile-contact-button profile-contact-call" href={contactActions.callHref}>
                      Call
                    </a>
                  )}
                  <a className="profile-contact-button profile-contact-instagram" href={contactActions?.instagramHref} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                  {contactActions?.emailHref && (
                    <a className="profile-contact-button profile-contact-email" href={contactActions.emailHref}>
                      Email
                    </a>
                  )}
                  <Link className="profile-contact-button profile-contact-feedback" href="/feedback">
                    Add Feedback
                  </Link>
                </div>
              </aside>
            </div>

            {(visibleGalleryImages.length > 0 || localVideos.length > 0 || SAMPLE_GALLERY_VIDEO) && (
              <section className="profile-gallery-section" aria-label={`${details.name || config.label} media`}>
                <div className="profile-gallery-header">
                  <h2>{details.name || config.label} media</h2>
                </div>
                <div className="profile-gallery-row">
                  {visibleGalleryImages.map((image, index) => (
                    <div className="profile-gallery-item" key={`${image}-${index}`}>
                      <img
                        src={image}
                        alt={`${details.name || config.label} photo ${index + 1}`}
                        onError={(event) => {
                          event.currentTarget.src = "/images/default-profile.svg";
                        }}
                      />
                    </div>
                  ))}

                  {/* Provider-uploaded videos (from localStorage) */}
                  {localVideos.map((vid) => (
                    <div className="profile-gallery-item profile-gallery-video" key={vid.id}>
                      <video
                        src={vid.src}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        aria-label={vid.name || `${details.name || config.label} video`}
                      />
                    </div>
                  ))}

                  {/* Sample / fallback video — always shown */}
                  <div className="profile-gallery-item profile-gallery-video">
                    <video
                      src={SAMPLE_GALLERY_VIDEO}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={`${details.name || config.label} sample video`}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
