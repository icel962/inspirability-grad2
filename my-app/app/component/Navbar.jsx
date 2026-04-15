"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false); // To track hydration
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Signal that the component has mounted on the client
    setMounted(true);

    // 2. Check for the token only on the client
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // 3. Handle scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false); // Update state immediately
    router.push("/login");
    // You can remove window.location.reload() if you update state properly
  };

  // IMPORTANT: If not mounted, render a "neutral" version or null 
  // to ensure server and client match perfectly on first pass.
  if (!mounted) {
    return (
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo" style={{ cursor: "pointer" }}>
          <Image src="/images/logo.jpeg" alt="logo" width={40} height={40} />
          <span>INSPIRABILITY</span>
        </div>
        {/* Render static links only during hydration to avoid mismatch */}
        <ul className="nav-links">
           <li><Link href="/home">Home</Link></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div
        className="logo"
        onClick={() => router.push("/home")}
        style={{ cursor: "pointer" }}
      >
        <Image src="/images/logo.jpeg" alt="logo" width={40} height={40} />
        <span>INSPIRABILITY</span>
      </div>

      <ul className="nav-links">
        <li className={isActive("/home") ? "active" : ""}>
          <Link href="/home">Home</Link>
        </li>
        <li className={isActive("/about") ? "active" : ""}>
          <Link href="/about">About</Link>
        </li>
        <li className={isActive("/services") ? "active" : ""}>
          <Link href="/services">Services</Link>
        </li>
        <li className={isActive("/contact") ? "active" : ""}>
          <Link href="/contact">Contact</Link>
        </li>

        {!isLoggedIn ? (
          <>
            <li className={isActive("/signup") ? "active" : ""}>
              <Link href="/signup">Sign Up</Link>
            </li>
            <li>
              <Link
                href="/login"
                className={`login-btn ${isActive("/login") ? "active-btn" : ""}`}
              >
                Login
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className={isActive("/profile") ? "active" : ""}>
              <Link href="/profile" className="profile-link">
                Profile
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn-nav">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}