"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/app/lib/api";
import FilterBar from "./shared/FilterBar";
import CardGrid from "./shared/CardGrid";
import {
  getDiagnosisValues,
  getMaxNumberFromText,
  getNumber,
  getOptions,
  normalizeOptionValue,
} from "./shared/filterUtils";
import "../styles/school.css";

const medicalBudgetMax = 5000;

const medicalAgeOptions = [
  { value: "toddlers", label: "Toddlers" },
  { value: "children", label: "Children" },
  { value: "teenagers", label: "Teenagers" },
  { value: "adults", label: "Adults" },
  { value: "seniors", label: "Seniors" },
];

const medicalReviewOptions = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars & up" },
  { value: "3", label: "3 stars & up" },
  { value: "2", label: "2 stars & up" },
  { value: "1", label: "1 star & up" },
];

const fallbackRatings = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];
const fallbackDistances = [2, 5, 8, 12, 16, 20, 24, 28, 32, 35];
const fallbackBudgets = [250, 350, 450, 600, 800, 1000, 1500, 2200, 3000, 4000, 5000];
const fallbackAgeGroups = ["toddlers", "children", "teenagers", "adults", "seniors"];

const getFallbackValue = (values, index) => values[index % values.length];

const getMedicalAgeFilterValues = (item) => {
  const values = [item.ageGroup, item.age_group, item.ageGroups]
    .flatMap((value) => (Array.isArray(value) ? value : String(value || "").split(/[,;|]/)))
    .map((value) => normalizeOptionValue(value))
    .filter(Boolean);

  return values.flatMap((value) => {
    if (value.includes("toddler")) return ["toddlers"];
    if (value.includes("child") || value.includes("children") || value.includes("kid")) {
      return ["children"];
    }
    if (value.includes("teen") || value.includes("adolescent")) return ["teenagers"];
    if (value.includes("adult")) return ["adults"];
    if (value.includes("senior") || value.includes("elder")) return ["seniors"];
    return [value];
  });
};

const getMedicalAgeGroup = (clinic, index) => {
  const ageValues = getMedicalAgeFilterValues({
    ageGroup: clinic.ageGroup,
    age_group: clinic.age_group,
    ageGroups: clinic.ageGroups,
  });

  return ageValues.length > 0 ? ageValues : [getFallbackValue(fallbackAgeGroups, index)];
};

const getFirstMedicalNumber = (...values) => {
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

const getSelectedNumber = (value, fallback) => {
  const selected = Number(value);
  return Number.isFinite(selected) ? selected : fallback;
};

const medicalFallbackImages = [
  "/images/Clinic.png",
  "/images/profile.png",
  "/images/ImageHandler.png",
  "/images/image (1).png",
  "/images/image (2).png",
  "/images/image (3).png",
];

const getMedicalProfileImage = (name, type, id) => {
  const label = `${name || ""} ${type || ""}`.toLowerCase();

  if (
    label.includes("clinic") ||
    label.includes("medical") ||
    label.includes("therapy") ||
    label.includes("therapist")
  ) {
    return "/images/Clinic.png";
  }

  if (label.includes("doctor") || label.includes("specialist")) {
    return "/images/profile.png";
  }

  const index = Math.abs(Number(id) || 0) % medicalFallbackImages.length;
  return medicalFallbackImages[index];
};

const MedicalSection = () => {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    budget: medicalBudgetMax,
    distance: 35,
    review: "all",
    diagnosis: "all",
    age: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const cardsPerPage = 8;

  useEffect(() => {
    fetch(apiUrl("/api/medical"))
      .then((res) => res.json())
      .then((data) => {
        setClinics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const data = useMemo(
    () =>
      clinics.map((clinic, index) => {
        const typeLabel = clinic.specialization_type || clinic.clinic_type || "N/A";
        const diagnoses = getDiagnosisValues(
          clinic.specialization_type,
          clinic.clinic_type,
          clinic.specialized_therapists
        );
        const price =
          getFirstMedicalNumber(
            clinic.budget,
            clinic.price,
            clinic.fee,
            clinic.cost,
            clinic.sessionPrice,
            clinic.session_price,
            clinic.session_price_max,
            clinic.session_price_min,
            clinic.session_price_range
          ) ?? getFallbackValue(fallbackBudgets, index);
        const distance =
          getFirstMedicalNumber(
            clinic.distance,
            clinic.distanceKm,
            clinic.distance_km,
            clinic.km
          ) ?? getFallbackValue(fallbackDistances, index);
        const rating =
          getFirstMedicalNumber(
            clinic.rating,
            clinic.review,
            clinic.reviews,
            clinic.stars
          ) ?? getFallbackValue(fallbackRatings, index);
        const ageGroups = getMedicalAgeGroup(clinic, index);

        return {
          id: `medical-${clinic.clinic_id}`,
          name: clinic.clinic_name || "",
          description: [
            clinic.clinic_type,
            clinic.specialization_type,
            clinic.specialized_therapists,
            clinic.working_hours_and_days,
          ]
            .filter(Boolean)
            .join(" "),
          type: normalizeOptionValue(typeLabel) || "other",
          typeLabel,
          diagnoses,
          ageGroups,
          price,
          distance,
          rating,
          location: clinic.location || "N/A",
          phone: clinic.phone_number || "N/A",
          profilePhoto: getMedicalProfileImage(
            clinic.clinic_name,
            typeLabel,
            clinic.clinic_id
          ),
          cardClassName: "medical-card",
          detailsHref: `/medical/${clinic.clinic_id}`,
          appointmentHref: `/appointment?type=clinic&id=${clinic.clinic_id}&name=${encodeURIComponent(clinic.clinic_name || "")}`,
        };
      }),
    [clinics]
  );

  const filterBounds = useMemo(
    () => ({
      budgetMax: medicalBudgetMax,
      distanceMax: 35,
    }),
    [data]
  );

  const typeOptions = useMemo(() => getOptions(data, "typeLabel"), [data]);
  const diagnosisOptions = useMemo(() => getOptions(data, "diagnoses"), [data]);

  useEffect(() => {
    // Keep default sliders at the loaded max so the reset state shows all cards.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((current) => ({
      ...current,
      budget: Math.min(
        Math.max(Number(current.budget || 0), medicalBudgetMax),
        medicalBudgetMax
      ),
      distance: Math.max(Number(current.distance || 0), filterBounds.distanceMax),
    }));
  }, [filterBounds.budgetMax, filterBounds.distanceMax]);

  const filteredData = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const selectedBudget = getSelectedNumber(filters.budget, medicalBudgetMax);
    const selectedDistance = getSelectedNumber(filters.distance, filterBounds.distanceMax);
    const selectedRating = filters.review === "all" ? null : Number(filters.review);

    return data.filter((item) => {
      const diagnoses = item.diagnoses || [];
      const itemAgeGroups = getMedicalAgeFilterValues(item);
      const searchableText = [
        item.name,
        item.description,
        item.typeLabel,
        item.phone,
        item.location,
        diagnoses.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchLower && !searchableText.includes(searchLower)) return false;
      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (
        filters.diagnosis !== "all" &&
        !diagnoses.some((diagnosis) => normalizeOptionValue(diagnosis) === filters.diagnosis)
      ) {
        return false;
      }
      if (
        filters.age !== "all" &&
        !itemAgeGroups.includes(filters.age)
      ) {
        return false;
      }
      if (item.price > selectedBudget) return false;
      if (item.distance > selectedDistance) return false;
      if (selectedRating != null && item.rating < selectedRating) return false;

      return true;
    });
  }, [data, filterBounds, filters, search]);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredData.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredData.length / cardsPerPage);

  return (
    <div className="sport-section">
      <section className="page-header">
        <div className="page-header-content">
          <h1>Medical Profiles</h1>
          <p>
            Browse inclusive medical clinics and specialists tailored for different needs and care levels.
          </p>
        </div>
      </section>

      <FilterBar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        filters={filters}
        setFilters={(next) => {
          setFilters(next);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search medical center..."
        typeOptions={typeOptions}
        diagnosisOptions={diagnosisOptions}
        ageOptions={medicalAgeOptions}
        reviewOptions={medicalReviewOptions}
        budgetMax={filterBounds.budgetMax}
        distanceMax={filterBounds.distanceMax}
        variant="sport"
      />

      {loading ? (
        <p>Loading medical clinics...</p>
      ) : (
        <>
          <CardGrid
            data={currentCards}
            emptyText="No medical clinics found."
            className="sport-cards-grid"
          />

          {totalPages > 1 && (
            <div className="sport-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                &lsaquo;
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                &rsaquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicalSection;
