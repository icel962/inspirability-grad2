"use client";

import { useEffect, useState } from "react";
import MedicalCard from "./MedicalCard";
import "../styles/school.css";

const MedicalSection = () => {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const cardsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:5000/api/medical")
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

  const filtered = clinics.filter((clinic) =>
    clinic.clinic_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filtered.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  return (
    <div className="medical-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search medical clinic..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading medical clinics...</p>
      ) : (
        <>
          <div className="grid-container">
            {currentCards.length > 0 ? (
              currentCards.map((clinic) => <MedicalCard key={clinic.clinic_id} clinic={clinic} />)
            ) : (
              <p>No medical clinics found.</p>
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

export default MedicalSection;
