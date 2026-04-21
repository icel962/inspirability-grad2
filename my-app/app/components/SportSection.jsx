"use client";

import { useEffect, useState } from "react";
import SportCard from "./SportCard";
import "../styles/school.css";

const SportSection = () => {
  const [sports, setSports] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const cardsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:5000/api/sports")
      .then((res) => res.json())
      .then((data) => {
        setSports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const filtered = sports.filter((sport) =>
    sport.sport_center_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filtered.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  return (
    <div className="sport-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search sport center..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading sport centers...</p>
      ) : (
        <>
          <div className="grid-container">
            {currentCards.length > 0 ? (
              currentCards.map((sport) => <SportCard key={sport.sport_center_id} sport={sport} />)
            ) : (
              <p>No sport centers found.</p>
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

export default SportSection;
