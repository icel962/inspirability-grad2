"use client";

import { useEffect, useState } from "react";
import SchoolCard from "./SchoolCard";
import "../styles/school.css";

const SchoolSection = () => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const cardsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:5000/api/schools")
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

  const filtered = schools.filter((school) =>
    school.school_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filtered.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  return (
    <div className="school-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search school..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <>
          <div className="grid-container">
            {currentCards.length > 0 ? (
              currentCards.map((school) => <SchoolCard key={school.school_id} school={school} />)
            ) : (
              <p>No schools found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchoolSection;
