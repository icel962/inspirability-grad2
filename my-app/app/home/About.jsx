import "./about.css";

export default function About() {
  return (
    <section className="about">
      <div className="about-container">

        {/* LEFT */}
        <div className="about-text">
          <span className="small-title">A BIT</span>
          <h2>ABOUT US</h2>

          <p>
            We are a dedicated platform designed to support parents of children
            with special needs by bringing together trusted sports, educational,
            and medical services, along with verified tutors, coaches, and
            specialists. Our goal is to simplify access to the right support and
            empower families to make confident choices for their children.
          </p>

          <button>EXPLORE MORE</button>
        </div>

        {/* RIGHT */}
        <div className="about-images">
          <img src="/images/about1.png" className="img1" />
          <img src="/images/about2.png" className="img2" />
          <img src="/images/about3.png" className="img3" />

          <div className="badge">
            <h3>10+</h3>
            <span>more</span>
          </div>
        </div>

      </div>
    </section>
  );
}