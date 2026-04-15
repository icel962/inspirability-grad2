"use client";
import "./sport.css";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useState } from "react";

const clubs = [
  "Ahly Club",
  "Wadi-Degla Club",
  "El-Themalek Club",
  "El-Shames Club",
  "Ghazal Mahalla Club",
  "Pyramids Club",
  "Ismaili Club",
  "Anointed Club",
];

export default function SportPage() {
  const [activeFilter, setActiveFilter] = useState(null);

  return (
    <>
      <Navbar />

      <section className="sport">

        {/* HEADER */}
        <div className="top-bar">
          <h2>Sport Section</h2>

          <div className="filters">

            <div
              className={`filter ${activeFilter === "type" ? "active" : ""}`}
              onClick={() => setActiveFilter("type")}
            >
              type special ▾
            </div>

            <div
              className={`filter ${activeFilter === "budget" ? "active" : ""}`}
              onClick={() => setActiveFilter("budget")}
            >
              budget ▾
            </div>

            <div
              className={`filter ${activeFilter === "distance" ? "active" : ""}`}
              onClick={() => setActiveFilter("distance")}
            >
              distance ▾
            </div>

            <div
              className={`filter ${activeFilter === "review" ? "active" : ""}`}
              onClick={() => setActiveFilter("review")}
            >
              review ▾
            </div>

            <input placeholder="search for club" />
          </div>
        </div>

        {/* CARDS */}
        <div className="grid">
          {clubs.map((club, i) => (
            <div className="card" key={i}>
              <div className="logo-box"></div>

              <h3>{club}</h3>

              <p><b>special support</b> physical</p>
              <p><b>distance</b> 2km-10km</p>
              <p><b>budget</b> 20,000-30,000EGP</p>

              <p className="stars">⭐⭐⭐⭐⭐</p>

              <button>More Details</button>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={i === 0 ? "active" : ""}>
              {i + 1}
            </span>
          ))}
        </div>

      </section>

    </>
  );
}