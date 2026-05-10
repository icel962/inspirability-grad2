"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/app/lib/api";
import FilterBar from "./shared/FilterBar";
import CardGrid from "./shared/CardGrid";
import "../styles/school.css";

const normalizeText = (value) => String(value || "").trim();

const splitList = (value) =>
  Array.isArray(value)
    ? value.map(normalizeText).filter(Boolean)
    : String(value || "")
        .split(",")
        .map(normalizeText)
        .filter(Boolean);

const normalizeType = (value) => {
  const type = normalizeText(value).toLowerCase();
  if (type.includes("academy")) return "academy";
  if (type.includes("gym") || type.includes("fitness")) return "fitness";
  if (type.includes("club")) return "club";
  return "other";
};

const sportFallbackImages = [
  "/images/Egytennis-el-Ahly-nasrcity-courts-02.png",
  "/images/csc-campus-view.jpg",
  "/images/Banner-6.jpg",
  "/images/Artboard-28.png",
  "/images/747.png",
  "/images/1.jpg",
  "/images/2.jpg",
];

const getSportProfileImage = (name, id) => {
  const normalizedName = normalizeText(name).toLowerCase();

  if (normalizedName.includes("ahly")) {
    return "/images/Al_Ahly_SC_logo.svg.png";
  }

  if (normalizedName.includes("zamalek")) {
    return "/images/zamalek.png";
  }

  if (normalizedName.includes("wadi") || normalizedName.includes("degla")) {
    return "/images/Wadi Debla.jpg";
  }

  const index = Math.abs(Number(id) || 0) % sportFallbackImages.length;
  return sportFallbackImages[index];
};

const getAgeGroups = (value) => {
  const text = normalizeText(value).toLowerCase();
  // null / empty → treat as "all ages" so the card shows under every age filter
  if (!text) return ["Kids", "Teens", "Adults"];

  // "all ages", "all", "everyone", etc. → all three groups
  if (
    /\ball\b/.test(text) ||
    text.includes("all age") ||
    text.includes("any age") ||
    text.includes("everyone")
  ) {
    return ["Kids", "Teens", "Adults"];
  }

  const result = new Set();

  // keyword matches (word-boundary or substring is fine for these)
  if (/kid|kids|child|children/.test(text)) result.add("Kids");
  if (/teen|teens|teenager|adolescent|junior/.test(text)) result.add("Teens");
  if (/adult|adults/.test(text)) result.add("Adults");
  // "youth" covers both kids and teens
  if (/\byouth\b/.test(text)) { result.add("Kids"); result.add("Teens"); }

  // numeric range: extract ALL numbers so "4-18" maps to Kids + Teens + Adults
  const numbers = (text.match(/\d+/g) || []).map(Number).filter((n) => n >= 1 && n <= 100);
  if (numbers.length > 0) {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    if (min <= 12) result.add("Kids");
    if (max >= 10 && min <= 17) result.add("Teens");
    if (max >= 18) result.add("Adults");
  }

  // if nothing matched at all, treat as all-ages (don't silently hide the card)
  if (result.size === 0) return ["Kids", "Teens", "Adults"];

  return [...result];
};

// Derive an approximate distance (km) from the location string.
// Used when the DB has no distance column so the slider stays functional.
const LOCATION_DISTANCES = {
  "garden city": 2, "downtown": 2, "wust el balad": 2,
  "zamalek": 3, "gezira": 4,
  "dokki": 5, "agouza": 5,
  "mohandessin": 6, "mohandes": 6,
  "imbaba": 7, "bulaq": 6,
  "giza": 10, "haram": 12, "faisal": 12,
  "nasr city": 11, "nasr": 11,
  "shubra": 9, "matariya": 13,
  "heliopolis": 14, "misr el gedida": 14, "masr el gedida": 14,
  "maadi": 13, "hadayek el maadi": 14,
  "mokattam": 17, "moqattam": 17,
  "ain shams": 15, "el marg": 20,
  "new cairo": 28, "fifth settlement": 28, "tagamou": 28,
  "shorouk": 25, "el shorouk": 25,
  "sheikh zayed": 28, "zayed": 28,
  "rehab": 30, "el rehab": 30,
  "october": 35, "6th": 35,
  "obour": 36, "badr": 40,
};

const getDistanceFromLocation = (location) => {
  const loc = normalizeText(location).toLowerCase();
  for (const [key, dist] of Object.entries(LOCATION_DISTANCES)) {
    if (loc.includes(key)) return dist;
  }
  return 15; // moderate default for unknown locations
};

// Safely parse any rating value into a number, or null when data is absent.
const parseRating = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const match = String(value).match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

// Derive a quality score (2.5–5.0) from real record attributes when the DB
// has no dedicated rating column.  Each quality indicator adds 0.5 stars.
const computeRating = (record) => {
  let score = 2.5;
  if (Number(record.special_coach_availability) === 1) score += 0.5;
  if (Number(record.adaptive_equipments) === 1)        score += 0.5;
  if (String(record.coach_certifications  || "").trim().length > 2) score += 0.5;
  if (String(record.staff_qualifications  || "").trim().length > 2) score += 0.5;
  if (String(record.supported_conditions  || "").trim().length > 2) score += 0.5;
  return Math.min(5, score);
};

// Match a card's rating against the selected filter threshold.
const matchesRatingFilter = (cardRating, selectedRating) => {
  const rating   = parseRating(cardRating);
  const selected = String(selectedRating || "").toLowerCase().trim();

  if (!selected || selected === "all" || selected === "any") return true;
  if (rating === null) return false;

  if (selected.includes("5")) return rating >= 5;
  if (selected.includes("4")) return rating >= 4;
  if (selected.includes("3")) return rating >= 3;
  if (selected.includes("2")) return rating >= 2;
  return true;
};

const getDiagnosisValues = (value) => {
  const diagnoses = splitList(value);
  const aliases = [];

  diagnoses.forEach((diagnosis) => {
    const normalized = diagnosis.toLowerCase();
    aliases.push(diagnosis);

    if (normalized === "cp" || normalized.includes("cerebral")) {
      aliases.push("Cerebral Palsy");
    }

    if (
      normalized.includes("mobility") ||
      normalized.includes("physical") ||
      normalized.includes("impairment")
    ) {
      aliases.push("Physical Disability");
    }

    if (normalized.includes("learning")) {
      aliases.push("Dyslexia");
    }
  });

  return [...new Set(aliases)];
};

const SportSection = () => {
  const [sportsCenters, setSportsCenters] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    budget: 900,
    distance: 35,
    review: "all",
    diagnosis: "all",
    age: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardsPerPage = 8;
  const totalPages = 2;

  // Fetch sport centers from database on component mount
  useEffect(() => {
    async function fetchSportsCenters() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiUrl("/api/sport-centers"));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sport centers: ${response.statusText}`);
        }

        const records = await response.json();

          const normalizedRecords = records.map((record) => {
          const diagnoses = getDiagnosisValues(record.supported_conditions);
          const ageGroups = getAgeGroups(record.age);
          const typeLabel = record.sport_center_type || "Other";
          const sessionMin = Number(record.session_price_min || 0);
          const sessionMax = Number(record.session_price_max || 0);
          const budget = sessionMax || sessionMin || 0;
          const distance =
            Number(record.distance || record.distance_km || 0) ||
            getDistanceFromLocation(record.location);

          return {
            id: `sport-${record.sport_center_id}`,
            sport_center_id: record.sport_center_id,
            name: record.sport_center_name || "",
            description: record.details || record.more_info || record.sport_center_type || "",
            type: normalizeType(typeLabel),
            typeLabel,
            location: record.location || "N/A",
            phone: record.phone_number || "N/A",
            email: record.email_address || "N/A",
            diagnoses: diagnoses,
            ageGroups: ageGroups,
            budget,
            distance,
            review: record.review != null ? Number(record.review) : computeRating(record),
            image: "",
            profilePhoto: getSportProfileImage(
              record.sport_center_name,
              record.sport_center_id
            ),
            cardClassName: "sport-card",
            detailsHref: `/sport/${record.sport_center_id}`,
            appointmentHref: `/appointment?type=sport&id=${record.sport_center_id}&name=${encodeURIComponent(
              record.sport_center_name || ""
            )}`,
          };
        });

        const maxBudget = Math.max(900, ...normalizedRecords.map((card) => card.budget || 0));
        const maxDistance = Math.max(35, ...normalizedRecords.map((card) => card.distance || 0));

        setSportsCenters(normalizedRecords);
        setFilters((current) => ({
          ...current,
          budget: Math.max(Number(current.budget || 0), maxBudget),
          distance: Math.max(Number(current.distance || 0), maxDistance),
        }));
      } catch (error) {
        console.error("Failed to fetch sport centers:", error);
        setError("Failed to load sport centers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchSportsCenters();
  }, []);

  const filterBounds = useMemo(() => {
    return {
      budgetMax: Math.max(900, ...sportsCenters.map((card) => card.budget || 0)),
      distanceMax: Math.max(35, ...sportsCenters.map((card) => card.distance || 0)),
    };
  }, [sportsCenters]);

  const filteredSports = useMemo(() => {
    const search_term = search.trim().toLowerCase();

    console.log("Selected rating filter:", filters.review);

    const result = sportsCenters.filter((card) => {
      // diagnoses and ageGroups are already normalised arrays on the card object
      const diagnoses = Array.isArray(card.diagnoses)
        ? card.diagnoses
        : splitList(card.diagnoses);
      const ageGroups = Array.isArray(card.ageGroups)
        ? card.ageGroups
        : splitList(card.ageGroups);

      const searchableText = [
        card.name,
        card.description,
        card.type,
        card.typeLabel,
        card.location,
        card.phone,
        card.email,
        diagnoses.join(" "),
        ageGroups.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Pull the real rating from whichever field exists on the card
      const cardRatingRaw =
        card.review ?? card.rating ?? card.reviews ??
        card.stars ?? card.score ?? card.averageRating ??
        card.avg_rating ?? card.reviewScore;

      console.log("Card rating raw:", cardRatingRaw);
      console.log("Parsed card rating:", parseRating(cardRatingRaw));

      const matchesSearch = !search_term || searchableText.includes(search_term);
      const matchesType   = filters.type === "all" || card.type === filters.type;
      const matchesDiagnosis =
        filters.diagnosis === "all" || diagnoses.includes(filters.diagnosis);
      const matchesAge =
        filters.age === "all" || ageGroups.includes(filters.age);
      const matchesBudget =
        Number(card.budget || 0) <= Number(filters.budget || Infinity);
      const matchesDistance =
        Number(card.distance || 0) <= Number(filters.distance || Infinity);
      const matchesRating = matchesRatingFilter(cardRatingRaw, filters.review);

      console.log("Matches rating filter:", matchesRating);

      return (
        matchesSearch &&
        matchesType &&
        matchesDiagnosis &&
        matchesAge &&
        matchesBudget &&
        matchesDistance &&
        matchesRating
      );
    });

    console.log("Filtered sports cards after rating:", result);
    return result;
  }, [filters, search, sportsCenters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  const paginatedSports = filteredSports.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="sport-section">
      <section className="page-header">
        <div className="page-header-content">
          <h1>Sports Profiles</h1>
          <p>
            Browse inclusive sports clubs and academies tailored for different needs and skill levels.
          </p>
        </div>
      </section>

      <FilterBar
        search={search}
        setSearch={(value) => {
          setSearch(value);
        }}
        filters={filters}
        setFilters={setFilters}
        searchPlaceholder="Search sport center..."
        budgetMax={filterBounds.budgetMax}
        distanceMax={filterBounds.distanceMax}
        variant="sport"
      />

      {loading ? (
        <p>Loading sport centers...</p>
      ) : (
        <>
          <CardGrid
            data={paginatedSports}
            emptyText="No sport centers found."
            className="sport-cards-grid"
          />

          <div className="sport-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              ‹
            </button>

            {[1, 2].map((page) => (
              <button
                key={page}
                type="button"
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === 2}
              onClick={() => setCurrentPage(2)}
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SportSection;
