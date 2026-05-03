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

const getAgeGroups = (value) => {
  const groups = splitList(value);

  return groups.flatMap((group) => {
    const normalized = group.toLowerCase();
    const ageNumber = Number.parseInt(group, 10);

    if (normalized.includes("kid") || normalized.includes("child")) return ["Kids"];
    if (normalized.includes("teen")) return ["Teens"];
    if (normalized.includes("adult")) return ["Adults"];
    if (!Number.isNaN(ageNumber)) {
      if (ageNumber <= 12) return ["Kids"];
      if (ageNumber <= 17) return ["Teens"];
      return ["Adults"];
    }

    return [group];
  });
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
          const distance = Number(record.distance || record.distance_km || 0);

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
            review: Number(record.review || 0),
            image: "",
            cardClassName: "sport-card",
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

    return sportsCenters.filter((card) => {
      const diagnoses = splitList(card.diagnoses);
      const ageGroups = splitList(card.ageGroups);
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

      const matchesSearch = !search_term || searchableText.includes(search_term);
      const matchesType = filters.type === "all" || card.type === filters.type;
      const matchesDiagnosis =
        filters.diagnosis === "all" || diagnoses.includes(filters.diagnosis);
      const matchesAge = filters.age === "all" || ageGroups.includes(filters.age);
      const matchesBudget = Number(card.budget || 0) <= Number(filters.budget || Infinity);
      const matchesDistance =
        Number(card.distance || 0) <= Number(filters.distance || Infinity);
      const matchesReview =
        filters.review === "all" || Number(card.review || 0) >= Number(filters.review);

      return (
        matchesSearch &&
        matchesType &&
        matchesDiagnosis &&
        matchesAge &&
        matchesBudget &&
        matchesDistance &&
        matchesReview
      );
    });
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
