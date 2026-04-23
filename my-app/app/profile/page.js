"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import "./profile.css";

export default function Profile() {
  const [data, setData] = useState(null);
  const [editMain, setEditMain] = useState(false);
  const [editRoleSection, setEditRoleSection] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ================= FETCH PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { profile, role, user } = res.data;

        // format date for parent only
        if (profile?.DOB_child) {
          profile.DOB_child = profile.DOB_child.split("T")[0];
        }

        setData({ profile, role, user });
        setFormData(profile);

      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/parents/update",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        setData((prev) => ({
          ...prev,
          profile: formData,
        }));

        setEditMain(false);
        setEditRoleSection(false);

        alert("Profile updated successfully!");
      }
    } catch (err) {
      alert("Error saving profile.");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return null;

  const { profile, role, user } = data;

  return (
    <div className="profile">

      {/* ================= TOP CARD ================= */}
      <div className="profile-card">
        <Image src="/images/profile.png" alt="profile" width={100} height={100} />

        <h3>
          {profile.school_name ||
            profile.clinic_name ||
            profile.sport_center_name ||
            profile.name ||
            "User Name"}
        </h3>

        <span>{role?.toUpperCase()} ACCOUNT</span>
        <p>{user?.email}</p>

        <button className="edit-photo-btn">Edit Photo</button>
      </div>

      {/* ================= GRID ================= */}
      <div className="profile-grid">

        {/* ================= MAIN INFO ================= */}
        <div className="card">
          <h3>Main Info</h3>

          <div className="info">

            <div className="info-item">
              <strong>Name:</strong>
              {editMain ? (
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>
                  {profile.name ||
                    profile.school_name ||
                    profile.clinic_name ||
                    profile.sport_center_name ||
                    "N/A"}
                </span>
              )}
            </div>

            <div className="info-item">
              <strong>Government:</strong>
              {editMain ? (
                <input
                  name="government"
                  value={formData.government || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.government || "N/A"}</span>
              )}
            </div>

            <div className="info-item">
              <strong>City:</strong>
              {editMain ? (
                <input
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.city || "N/A"}</span>
              )}
            </div>

          </div>

          <button onClick={() => (editMain ? handleSave() : setEditMain(true))}>
            {editMain ? "Save Main Info" : "Edit Main Info"}
          </button>
        </div>

        {/* ================= ROLE SECTION ================= */}
        {role === "parent" ? (
          <div className="card">
            <h3>Kid Info</h3>

            <div className="info">

              <div className="info-item">
                <strong>DOB:</strong>
                {editRoleSection ? (
                  <input
                    name="DOB_child"
                    value={formData.DOB_child || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.DOB_child || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Gender:</strong>
                {editRoleSection ? (
                  <input
                    name="gender_child"
                    value={formData.gender_child || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.gender_child || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Special Type:</strong>
                {editRoleSection ? (
                  <input
                    name="medical_classification_diagnose"
                    value={formData.medical_classification_diagnose || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.medical_classification_diagnose || "None"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Education:</strong>
                {editRoleSection ? (
                  <input
                    name="education_level_child"
                    value={formData.education_level_child || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.education_level_child || "N/A"}</span>
                )}
              </div>

            </div>

            <button onClick={() => setEditRoleSection(!editRoleSection)}>
              {editRoleSection ? "Stop Edit" : "Edit Info"}
            </button>
          </div>
        ) : role === "school" ? (
          <div className="card">
            <h3>School Info</h3>

            <div className="info">

              <div className="info-item">
                <strong>Category:</strong>
                {editRoleSection ? (
                  <input
                    name="category_of_school"
                    value={formData.category_of_school || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.category_of_school || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Curriculum:</strong>
                {editRoleSection ? (
                  <input
                    name="curriculum_type"
                    value={formData.curriculum_type || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.curriculum_type || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Level:</strong>
                {editRoleSection ? (
                  <input
                    name="educational_level"
                    value={formData.educational_level || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.educational_level || "N/A"}</span>
                )}
              </div>

            </div>

            <button onClick={() => setEditRoleSection(!editRoleSection)}>
              {editRoleSection ? "Stop Edit" : "Edit Info"}
            </button>
          </div>
        ) : role === "sport" ? (
          <div className="card">
            <h3>Sport Center Info</h3>

            <div className="info">

              <div className="info-item">
                <strong>Sports:</strong>
                {editRoleSection ? (
                  <input
                    name="sports_type_offered"
                    value={formData.sports_type_offered || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.sports_type_offered || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Age:</strong>
                {editRoleSection ? (
                  <input
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.age || "N/A"}</span>
                )}
              </div>

            </div>

            <button onClick={() => setEditRoleSection(!editRoleSection)}>
              {editRoleSection ? "Stop Edit" : "Edit Info"}
            </button>
          </div>
        ) : role === "clinic" ? (
          <div className="card">
            <h3>Clinic Info</h3>

            <div className="info">

              <div className="info-item">
                <strong>Type:</strong>
                {editRoleSection ? (
                  <input
                    name="clinic_type"
                    value={formData.clinic_type || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.clinic_type || "N/A"}</span>
                )}
              </div>

              <div className="info-item">
                <strong>Specialization:</strong>
                {editRoleSection ? (
                  <input
                    name="specialization_type"
                    value={formData.specialization_type || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.specialization_type || "N/A"}</span>
                )}
              </div>

            </div>

            <button onClick={() => setEditRoleSection(!editRoleSection)}>
              {editRoleSection ? "Stop Edit" : "Edit Info"}
            </button>
          </div>
        ) : null}

        {/* ================= CONTACT ================= */}
        <div className="card">
          <h3>Contact Info</h3>

          <div className="info">
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>

            <div className="info-item">
              <strong>Phone:</strong>
              {editMain ? (
                <input
                  name="tel_no"
                  value={formData.tel_no || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.tel_no || "N/A"}</span>
              )}
            </div>
          </div>

          <button onClick={() => (editMain ? handleSave() : setEditMain(true))}>
            {editMain ? "Save Contact" : "Edit Contact"}
          </button>
        </div>

      </div>

      {/* ================= LOGOUT ================= */}
      <div className="logout">
        <button onClick={handleLogout}>Logout</button>
      </div>

    </div>
  );
}