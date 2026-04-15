"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import "../styles/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { profile: userData, role } = res.data;

        if (userData.DOB_child) {
          userData.DOB_child = userData.DOB_child.split("T")[0];
        }

        const processedData = {
          parent: userData,
          role: role,
        };

        setProfile(processedData);
        setFormData(userData);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        "http://localhost:5000/api/parents/update",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setProfile((prev) => ({ ...prev, parent: formData }));
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      alert("Error while saving profile settings.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return null;

  const { parent } = profile;

  return (
    <div className="profile">
      {/* TOP CARD */}
      <div className="profile-card">
        <Image
          src="/images/profile.png"
          alt="profile"
          width={100}
          height={100}
        />
        <h3>{parent.name || "User Name"}</h3>
        <span>{profile.role?.toUpperCase()} ACCOUNT</span>
        <button className="edit-photo-btn">Edit Photo</button>
      </div>

      {/* INFO CARDS GRID */}
      <div className="profile-grid">
        
        {/* Parent Info */}
        <div className="card">
          <h3>Parent Info</h3>
          <div className="info">
            <div className="info-item">
              <strong>Full Name:</strong>
              {editMode ? (
                <input name="name" value={formData.name || ""} onChange={handleChange} />
              ) : (
                <span>{parent.name || "N/A"}</span>
              )}
            </div>
            <div className="info-item">
              <strong>Government:</strong>
              {editMode ? (
                <input name="government" value={formData.government || ""} onChange={handleChange} />
              ) : (
                <span>{parent.government || "N/A"}</span>
              )}
            </div>
            <div className="info-item">
              <strong>City:</strong>
              {editMode ? (
                <input name="city" value={formData.city || ""} onChange={handleChange} />
              ) : (
                <span>{parent.city || "N/A"}</span>
              )}
            </div>
          </div>
          <button onClick={() => (editMode ? handleSave() : setEditMode(true))}>
            {editMode ? "Save Info" : "Edit Info"}
          </button>
        </div>

        {/* Kid Info */}
        <div className="card">
          <h3>Kid Info</h3>
          <div className="info">
            <p><strong>DOB:</strong> {parent.DOB_child || "N/A"}</p>
            <p><strong>Gender:</strong> {parent.gender_child || "N/A"}</p>
            <p><strong>Special Type:</strong> {parent.medical_classification_diagnose || "None"}</p>
            <p><strong>Education:</strong> {parent.education_level_child || "N/A"}</p>
          </div>
          <button onClick={() => setEditMode(true)}>Edit Info</button>
        </div>

        {/* Contact Info */}
        <div className="card">
          <h3>Contact Info</h3>
          <div className="info">
            <p><strong>Email:</strong> {parent.email || "N/A"}</p>
            <div className="info-item">
              <strong>Phone:</strong>
              {editMode ? (
                <input name="tel_no" value={formData.tel_no || ""} onChange={handleChange} />
              ) : (
                <span>{parent.tel_no || "N/A"}</span>
              )}
            </div>
          </div>
          <button onClick={() => (editMode ? handleSave() : setEditMode(true))}>
            {editMode ? "Save Contact" : "Edit Info"}
          </button>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="logout">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}