"use client";

import React, { useEffect, useState } from "react";
import SchoolCard from "./SchoolCard";
import "./school.css";

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

  const filtered = schools.filter((s) =>
    s.school_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filtered.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  return (
    <div className="school-section">
      {/* 🔍 Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search school..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ⏳ Loading */}
      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <>
          {/* 🏫 Grid */}
          <div className="grid-container">
            {currentCards.length > 0 ? (
              currentCards.map((school) => (
                <SchoolCard key={school.school_id} school={school} />
              ))
            ) : (
              <p>No schools found.</p>
            )}
          </div>

          {/* 🔢 Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
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
