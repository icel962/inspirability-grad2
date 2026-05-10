"use client";
import Link from "next/link";
import "./clubdetails.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ClubPage() {
  return (
    <>

      <section className="club">

        <div className="container">

          {/* LEFT SIDE */}
          <div className="left">

            <img src="/clubs/ahly.png" className="logo" />

            <div className="details">
              <h1>Ahly Club</h1>

              <p><b>special support:</b> physical</p>
              <p><b>distance:</b> 5km-10km</p>
              <p><b>review:</b> ⭐⭐⭐⭐⭐</p>

              <br />

              <p><b>sessions availability :</b> private session</p>
              <p className="green">special coach availability</p>
              <p><b>Email:</b> alahlyplatforms@gmail.com</p>
              <p><b>Fees:</b> 2,500 EGP / Month</p>

              <h2>Coach :</h2>

              <div className="coach">
                <img src="/coach1.jpg" />
                <img src="/coach2.jpg" />
                <img src="/coach3.jpg" />
              </div>

              <Link href="/appointment?type=sport&name=Ahly%20Club" className="appointment">
                Make an Appointment
              </Link>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="right">

            <h2>Ahly contact media</h2>

            <a className="btn whatsapp" href="https://wa.me/201000000000" target="_blank" rel="noreferrer">
              Whats app
            </a>
            <a className="btn facebook" href="https://www.facebook.com/alahly" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a className="btn call" href="tel:+201000000000">
              Call
            </a>
            <a className="btn instagram" href="https://www.instagram.com/alahly/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <Link className="btn feedback" href="/feedback">
              Add Feedback
            </Link>

          </div>

        </div>

      </section>

    </>
  );
}
