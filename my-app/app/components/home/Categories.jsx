import Link from "next/link";
import "../../styles/categories.css";

export default function Categories() {
  return (
    <section className="categories-section">
      <div className="categories-header">
        <h1>Our Categories</h1>
        <p>Explore trusted sports, school, and medical services plus verified tutors, coaches, and specialists, all in one place.</p>
      </div>

      <div className="categories-grid">
        <Link href="/sport" className="category-card" style={{ textDecoration: "none", color: "white" }}>
          <div>
            <i className="fas fa-medal"></i>
            <h3>Sport</h3>
            <p>Our support team will get assistance from AI-powered.</p>
          </div>
        </Link>

        <Link href="/school" className="category-card" style={{ textDecoration: "none", color: "white" }}>
          <div>
            <i className="fas fa-graduation-cap"></i>
            <h3>School</h3>
            <p>Our support team will get assistance from AI-powered.</p>
          </div>
        </Link>

        <Link href="/medical" className="category-card" style={{ textDecoration: "none", color: "white" }}>
          <div>
            <i className="fas fa-stethoscope"></i>
            <h3>Medical</h3>
            <p>Our support team will get assistance from AI-powered.</p>
          </div>
        </Link>

        <Link href="/contacts" className="category-card" style={{ textDecoration: "none", color: "white" }}>
          <div>
            <i className="fas fa-address-book"></i>
            <h3>Contacts</h3>
            <p>Our support team will get assistance from AI-powered.</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
