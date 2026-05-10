"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/app/lib/api";
import FilterBar from "./shared/FilterBar";
import CardGrid from "./shared/CardGrid";
import {
  getAgeGroups,
  getDiagnosisValues,
  getMaxNumberFromText,
  getNumber,
  getOptions,
  normalizeOptionValue,
} from "./shared/filterUtils";
import "../styles/school.css";

const schoolBudgetMax = 5000;

const schoolReviewOptions = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars & up" },
  { value: "3", label: "3 stars & up" },
  { value: "2", label: "2 stars & up" },
  { value: "1", label: "1 star & up" },
];

const fallbackRatings = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];
const fallbackDistances = [2, 5, 8, 12, 16, 20, 24, 28, 32, 35];
const fallbackBudgets = [0, 250, 500, 750, 1000, 1500, 2200, 3000, 4000, 5000];

const getFallbackValue = (values, index) => values[index % values.length];

const getFirstSchoolNumber = (...values) => {
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

const getSchoolBudget = (school, index) => {
  const budget = getFirstSchoolNumber(school.budget, school.price, school.fee, school.cost);
  if (budget != null && budget > 0) return budget;

  const annualFees = getFirstSchoolNumber(school.annual_fees);
  if (annualFees != null && annualFees > 0) return annualFees;

  const registrationFees = getFirstSchoolNumber(school.registration_fees);
  if (registrationFees != null && registrationFees > 0 && registrationFees >= 1000) {
    return registrationFees;
  }

  return getFallbackValue(fallbackBudgets, index);
};

const schoolAgePatterns = {
  kids: /(kg|kindergarten|nursery|primary|elementary|child|children|kid)/,
  teens: /(prep|middle|secondary|high|teen)/,
  adults: /(adult|vocational|university)/,
};

const schoolFallbackImages = [
  "/images/School.png",
  "/images/csc-campus-view.jpg",
  "/images/Banner-6.jpg",
  "/images/Artboard-28.png",
  "/images/1.jpg",
  "/images/2.jpg",
];

const getSchoolProfileImage = (name, type, id) => {
  const label = `${name || ""} ${type || ""}`.toLowerCase();

  if (label.includes("hope")) {
    return "/images/621c175954c1fe4ab610f948_hope-logo.png";
  }

  if (label.includes("canadian") || label.includes("csc")) {
    return "/images/csc-campus-view.jpg";
  }

  if (label.includes("school") || label.includes("academy")) {
    return "/images/School.png";
  }

  const index = Math.abs(Number(id) || 0) % schoolFallbackImages.length;
  return schoolFallbackImages[index];
};

const SchoolSection = () => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    budget: schoolBudgetMax,
    distance: 35,
    review: "all",
    diagnosis: "all",
    age: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/schools"))
      .then((res) => res.json())
      .then((data) => {
        setSchools(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const data = useMemo(
    () =>
      schools.map((school, index) => {
        const typeLabel =
          school.special_type ||
          school.curriculum_type ||
          school.category_of_school ||
          "N/A";
        const diagnoses = getDiagnosisValues(
          school.special_type,
          school.admission_details,
          school.history_info,
          school.teacher_training_status
        );
        const ageGroups = getAgeGroups(
          [school.educational_level, school.category_of_school, school.admission_details],
          schoolAgePatterns
        );
        const price = getSchoolBudget(school, index);
        const distance =
          getFirstSchoolNumber(
            school.distance,
            school.distanceKm,
            school.distance_km,
            school.km
          ) ?? getFallbackValue(fallbackDistances, index);
        const rating =
          getFirstSchoolNumber(
            school.rating,
            school.review,
            school.reviews,
            school.stars,
            school.average_rating
          ) ?? getFallbackValue(fallbackRatings, index);

        return {
          id: `school-${school.school_id}`,
          name: school.school_name || "",
          description: [
            school.category_of_school,
            school.curriculum_type,
            school.educational_level,
            school.admission_details,
            school.history_info,
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
          location: school.city || school.location || school.government || "N/A",
          phone: school.phone_number || school.tel_no || "N/A",
          profilePhoto: getSchoolProfileImage(school.school_name, typeLabel, school.school_id),
          detailsHref: `/school/${school.school_id}`,
          appointmentHref: `/appointment?type=school&id=${school.school_id}&name=${encodeURIComponent(school.school_name || "")}`,
        };
      }),
    [schools]
  );

  const filterBounds = useMemo(
    () => ({
      budgetMax: schoolBudgetMax,
      distanceMax: 35,
    }),
    [data]
  );

  const typeOptions = useMemo(() => getOptions(data, "typeLabel"), [data]);
  const diagnosisOptions = useMemo(() => getOptions(data, "diagnoses"), [data]);
  const ageOptions = useMemo(() => getOptions(data, "ageGroups"), [data]);

  useEffect(() => {
    // Keep default sliders at the loaded max so the reset state shows all cards.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((current) => ({
      ...current,
      budget: Math.min(
        Math.max(Number(current.budget || 0), schoolBudgetMax),
        schoolBudgetMax
      ),
      distance: Math.min(
        Math.max(Number(current.distance || 0), filterBounds.distanceMax),
        filterBounds.distanceMax
      ),
    }));
  }, [filterBounds.budgetMax, filterBounds.distanceMax]);

  const filteredData = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const selectedBudget = getSelectedNumber(filters.budget, schoolBudgetMax);
    const selectedDistance = getSelectedNumber(filters.distance, filterBounds.distanceMax);
    const selectedRating = filters.review === "all" ? null : Number(filters.review);

    return data.filter((item) => {
      const diagnoses = item.diagnoses || [];
      const ageGroups = item.ageGroups || [];
      const searchableText = [
        item.name,
        item.description,
        item.typeLabel,
        item.phone,
        item.location,
        diagnoses.join(" "),
        ageGroups.join(" "),
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
        !ageGroups.some((ageGroup) => normalizeOptionValue(ageGroup) === filters.age)
      ) {
        return false;
      }
      if (item.price > selectedBudget) return false;
      if (item.distance > selectedDistance) return false;
      if (selectedRating != null && item.rating < selectedRating) return false;

      return true;
    });
  }, [data, filterBounds, filters, search]);

  const cardsPerPage = 8;
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredData.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredData.length / cardsPerPage);

  return (
    <div className="sport-section">
      <section className="page-header">
        <div className="page-header-content">
          <h1>School Profiles</h1>
          <p>
            Browse inclusive schools and learning centers tailored for different needs and goals.
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
        searchPlaceholder="Search school..."
        typeOptions={typeOptions}
        diagnosisOptions={diagnosisOptions}
        ageOptions={ageOptions}
        reviewOptions={schoolReviewOptions}
        budgetMax={filterBounds.budgetMax}
        distanceMax={filterBounds.distanceMax}
        variant="sport"
      />

      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <>
          <CardGrid
            data={currentCards}
            emptyText="No schools found."
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

export default SchoolSection;
