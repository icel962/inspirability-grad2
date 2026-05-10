const defaultTypeOptions = [
  { value: "club", label: "Private Sports Club" },
  { value: "academy", label: "Sports Academy" },
  { value: "fitness", label: "Gym & Fitness" },
];

const defaultDiagnosisOptions = [
  { value: "Autism", label: "Autism" },
  { value: "ADHD", label: "ADHD" },
  { value: "Down Syndrome", label: "Down Syndrome" },
  { value: "Physical Disability", label: "Physical Disability" },
  { value: "Dyslexia", label: "Dyslexia" },
  { value: "Cerebral Palsy", label: "Cerebral Palsy" },
];

const defaultAgeOptions = [
  { value: "Kids", label: "Kids (4-12)" },
  { value: "Teens", label: "Teens (13-17)" },
  { value: "Adults", label: "Adults (18+)" },
];

const defaultReviewOptions = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars & up" },
  { value: "3", label: "3 stars & up" },
];

const FilterBar = ({
  search,
  setSearch,
  filters,
  setFilters,
  searchPlaceholder,
  typeOptions = defaultTypeOptions,
  diagnosisOptions = defaultDiagnosisOptions,
  ageOptions = defaultAgeOptions,
  reviewOptions = defaultReviewOptions,
  budgetMax = 900,
  distanceMax = 35,
  variant = "default",
}) => {
  if (variant === "sport") {
    return (
      <section className="sport-filters">
        <div className="sport-search-row">
          <span className="sport-search-icon" aria-hidden="true">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="sport-filter-grid">
          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-layer-group"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-type">Type / Specialty</label>
              <select
                id="profile-filter-type"
                value={filters.type}
                onChange={(event) => setFilters({ ...filters, type: event.target.value })}
              >
                <option value="all">All types</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-notes-medical"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-diagnosis">Diagnoses</label>
              <select
                id="profile-filter-diagnosis"
                value={filters.diagnosis || "all"}
                onChange={(event) => setFilters({ ...filters, diagnosis: event.target.value })}
              >
                <option value="all">All diagnoses</option>
                {diagnosisOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-child-reaching"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-age">Age Group</label>
              <select
                id="profile-filter-age"
                value={filters.age || "all"}
                onChange={(event) => setFilters({ ...filters, age: event.target.value })}
              >
                <option value="all">All ages</option>
                {ageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-star"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-review">Review</label>
              <select
                id="profile-filter-review"
                value={filters.review}
                onChange={(event) => setFilters({ ...filters, review: event.target.value })}
              >
                <option value="all">All ratings</option>
                {reviewOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-wallet"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-budget">
                Budget
                <span className="range-value">EGP {filters.budget}</span>
              </label>
              <input
                id="profile-filter-budget"
                type="range"
                min="0"
                max={budgetMax}
                value={filters.budget}
                onChange={(event) => setFilters({ ...filters, budget: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="sport-filter-card">
            <span className="sport-filter-icon" aria-hidden="true">
              <i className="fas fa-location-dot"></i>
            </span>
            <div className="sport-filter-content">
              <label htmlFor="profile-filter-distance">
                Distance
                <span className="range-value">{filters.distance} km</span>
              </label>
              <input
                id="profile-filter-distance"
                type="range"
                min="0"
                max={distanceMax}
                value={filters.distance}
                onChange={(event) => setFilters({ ...filters, distance: Number(event.target.value) })}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="search-section">
      <div className="search-container">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="filters-row">
        <div className="filter-box">
          <label className="filter-label" htmlFor="profile-filter-type">
            Type / Specialty
          </label>
          <select
            id="profile-filter-type"
            value={filters.type}
            onChange={(event) => setFilters({ ...filters, type: event.target.value })}
          >
            <option value="all">All types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label className="filter-label" htmlFor="profile-filter-diagnosis">
            Diagnoses
          </label>
          <select
            id="profile-filter-diagnosis"
            value={filters.diagnosis || "all"}
            onChange={(event) => setFilters({ ...filters, diagnosis: event.target.value })}
          >
            <option value="all">All diagnoses</option>
            {diagnosisOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label className="filter-label" htmlFor="profile-filter-age">
            Age Group
          </label>
          <select
            id="profile-filter-age"
            value={filters.age || "all"}
            onChange={(event) => setFilters({ ...filters, age: event.target.value })}
          >
            <option value="all">All ages</option>
            {ageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <div className="filter-top">
            <span className="filter-title">Budget</span>
            <strong>Up to EGP {filters.budget}</strong>
          </div>
          <input
            type="range"
            min="0"
            max={budgetMax}
            value={filters.budget}
            onChange={(event) => setFilters({ ...filters, budget: Number(event.target.value) })}
          />
        </div>

        <div className="filter-box">
          <div className="filter-top">
            <span className="filter-title">Distance</span>
            <strong>Up to {filters.distance} km</strong>
          </div>
          <input
            type="range"
            min="0"
            max={distanceMax}
            value={filters.distance}
            onChange={(event) => setFilters({ ...filters, distance: Number(event.target.value) })}
          />
        </div>

        <div className="filter-box">
          <label className="filter-label" htmlFor="profile-filter-review">
            Review
          </label>
          <select
            id="profile-filter-review"
            value={filters.review}
            onChange={(event) => setFilters({ ...filters, review: event.target.value })}
          >
            <option value="all">All ratings</option>
            {reviewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
