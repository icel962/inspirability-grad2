"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../signup/signup.css";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem(
  "payment_status",
  data.user.payment_status
);

localStorage.setItem(
  "approval_status",
  data.user.approval_status
);

// ✅ account approved
const isProvider =
  data.user.role === "school" ||
  data.user.role === "clinic" ||
  data.user.role === "sport";

if (isProvider && data.user.showApprovalMessage) {

  alert("🎉 Your account has been approved by admin!");

  await fetch(
    "http://localhost:5000/api/hide-approval-message",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );
}

if (isProvider && data.user.showPaymentMessage) {

  alert("✅ Your payment has been approved successfully!");

  await fetch(
    "http://localhost:5000/api/hide-payment-message",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );
}

if (isProvider && data.user.payment_status !== "approved") {
  router.push("/flat-fee");
  return;
}

      // 🔥 redirect حسب الرول من الباك
switch (data.user.role) {
  case "parent":
    router.replace("/home");
    break;

  case "admin":
    router.replace("/requests");
    break;

  case "clinic":
  case "sport":
  case "school":
    router.replace("/profile");
    break;

  default:
    router.replace("/login");
}
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="signup">
      <div className="signup-container">
        
        {/* LEFT */}
        <div className="left">
          <h1>Login</h1>
          <p>Enter your credentials</p>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="login-form">
            <h2>Welcome Back</h2>

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

            <button onClick={handleLogin}>Login</button>
          </div>
        </div>

      </div>
    </div>
  );
}