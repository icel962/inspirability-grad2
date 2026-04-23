"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../signup/signup.css";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelect = (r) => {
    setRole(r);
    setTimeout(() => setStep(2), 300);
  };

  const handleLogin = async () => {
  if (!formData.email || !formData.password)
    return alert("Please enter credentials");

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Login failed");

    // SAVE WORK TOKEN AND USER DATA
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.user.role);

    switch (data.user.role) {
      case "parent":
        alert("Welcome Parent!");
        router.replace("/home");
        break;

      case "admin":
        alert("Welcome Admin!");
        router.replace("/admin");
        break;

      case "clinic":
        alert("Welcome Clinic!");
        router.replace("/medical");
        break;

      case "sport":
        alert("Welcome Sport!");
        router.replace("/sport");
        break;

      case "school":
        alert("Welcome School!");
        router.replace("/school");
        break;

      default:
        alert("Unknown role");
        router.replace("/login");
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Check if backend is running.");
  }
};

  return (
    <div className="signup">
      <div className="signup-container">
        <div className="left">
          <h1>Login</h1>
          <p>Select your role and enter details</p>
          <div className="steps">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`circle ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          {step === 1 && (
            <div className="roles">
              {["Parent", "School", "Clinic", "Admin", "Sport"].map((r) => (
                <div
                  key={r}
                  className={`role-card ${role === r ? "selected" : ""}`}
                  onClick={() => handleSelect(r)}
                >
                  <Image
                    src={`/images/${r.toLowerCase()}.png`}
                    alt={r}
                    width={100}
                    height={100}
                  />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="login-form">
              <h2>{role} Login</h2>
              <input
                name="email"
                placeholder="Enter Email"
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                onChange={handleChange}
              />
              <div className="btns">
                <button onClick={() => setStep(1)}>Back</button>
                <button onClick={handleLogin}>Login</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
