"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "../styles/navbar.css";


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // New state to track mounting
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to false
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Signal that we are now on the client
    setMounted(true);

    // 2. Only check localStorage after mounting
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const syncAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

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
    setIsLoggedIn(false); 
    router.push("/login");
    // Removed reload() as manual state update is cleaner
  };

  // IMPORTANT: Prevent rendering dynamic auth links until mounted
  // This ensures the server and client initial HTML match perfectly
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

        {/* New Pricing Link */}
        <li className={isActive("/pricing") ? "active" : ""}>
          <Link href="/pricing">Pricing</Link>
        </li>

        {mounted && (
          <>
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
          </>
        )}
      </ul>
    </nav>
  );
}