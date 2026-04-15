"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "../styles/navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });
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

    const syncAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    syncAuthState();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncAuthState);
    };
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    // No need for a separate setIsLoggedIn state; 
    // simply redirecting or refreshing will re-evaluate the 'isLoggedIn' constant
    router.push("/login");
    if (typeof window !== "undefined") {
        window.location.reload(); // Ensures the Navbar state refreshes globally
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
        <Image src="/images/logo.jpeg" alt="logo" width={40} height={40} />
        <span>INSPIRABILITY</span>
      </div>

      <ul className="nav-links">
        <li className={isActive("/") ? "active" : ""}>
          <Link href="/">Home</Link>
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

        {/* Use the calculated isLoggedIn constant */}
        {!isLoggedIn ? (
          <>
            <li className={isActive("/signup") ? "active" : ""}>
              <Link href="/signup">Sign Up</Link>
            </li>
            <li>
              <Link href="/login" className={`login-btn ${isActive("/login") ? "active-btn" : ""}`}>
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
