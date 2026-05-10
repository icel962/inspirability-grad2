"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { apiUrl } from "@/app/lib/api";

import SchoolProfile from "@/app/components/Profile/SchoolProfile";
import ParentProfile from "@/app/components/Profile/ParentProfile";
import SportProfile from "@/app/components/Profile/SportProfile";
import ClinicProfile from "@/app/components/Profile/ClinicProfile";
import ProfileHeader from "@/app/components/Profile/ProfileHeader";
import ProviderMediaSection from "@/app/components/Profile/ProviderMediaSection";
import EditProfilePanel from "@/app/components/Profile/EditProfilePanel";
import "./profile.css";

// Returns the localStorage key for this provider's media, or null for parents
function getMediaKey(role, user) {
  if (!user || !role) return null;
  if (role === "clinic" || role === "medical") {
    return user.clinic_id ? `providerMedia_medical_${user.clinic_id}` : null;
  }
  if (role === "sport") {
    return user.sport_center_id ? `providerMedia_sport_${user.sport_center_id}` : null;
  }
  if (role === "school") {
    return user.school_id ? `providerMedia_school_${user.school_id}` : null;
  }
  return null;
}

// Mirrors the label-based image logic used by MedicalSection / SchoolSection / SportSection.
// Priority: backend-uploaded image → stored image field → name-based label match → neutral placeholder.
function getServiceImage(role, user, buildApiUrl) {
  if (!user) return "/images/default-profile.svg";

  if (user.image) return buildApiUrl(`/uploads/${user.image}`);

  // Explicit image fields stored on the record
  if (user.school_image) return user.school_image;
  if (user.clinic_image) return user.clinic_image;
  if (user.sport_center_image) return user.sport_center_image;
  if (user.logo) return user.logo;

  const lbl = (...parts) => parts.filter(Boolean).join(" ").toLowerCase();

  if (role === "medical" || role === "clinic") {
    const l = lbl(user.clinic_name, user.clinic_type, user.specialization_type);
    if (l.includes("clinic") || l.includes("medical") || l.includes("therapy") || l.includes("therapist")) {
      return "/images/Clinic.png";
    }
    if (l.includes("doctor") || l.includes("specialist")) {
      return "/images/profile.png";
    }
    return "/images/Clinic.png";
  }

  if (role === "school") {
    const l = lbl(user.school_name, user.special_type, user.category_of_school);
    if (l.includes("hope")) return "/images/621c175954c1fe4ab610f948_hope-logo.png";
    if (l.includes("canadian") || l.includes("csc")) return "/images/csc-campus-view.jpg";
    return "/images/School.png";
  }

  if (role === "sport") {
    const l = lbl(user.sport_center_name, user.sport_center_type);
    if (l.includes("ahly")) return "/images/Al_Ahly_SC_logo.svg.png";
    if (l.includes("zamalek")) return "/images/zamalek.png";
    if (l.includes("wadi") || l.includes("degla")) return "/images/Wadi Debla.jpg";
    return "/images/Egytennis-el-Ahly-nasrcity-courts-02.png";
  }

  return "/images/default-profile.svg";
}

const SAMPLE_VIDEO_SRC = "/images/GRAD.mp4";

// Builds the same media array shown by ProfileDetailsPage so Edit Profile is consistent.
// Mirrors getGalleryImages() fallback logic + always appends the sample video.
function buildComputedMediaForEdit(role, user, buildApiUrl) {
  if (!user) return [];

  const primaryImage = getServiceImage(role, user, buildApiUrl);

  // Collect explicit image URLs from the record (same fields as imageCandidates in ProfileDetailsPage)
  const explicitImages = [
    user.images, user.photos, user.gallery, user.gallery_images,
    user.profile_photo, user.school_image, user.clinic_image,
    user.sport_center_image, user.logo,
  ]
    .flatMap((v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return String(v).split(/[,;|]/);
    })
    .map((v) => {
      const text = String(v || "").trim();
      if (!text) return "";
      if (text.startsWith("data:") || /^https?:\/\//i.test(text) || text.startsWith("/")) return text;
      return `/images/${text.replace(/^images[\\/]/i, "")}`;
    })
    .filter(Boolean);

  // Role-based fallback images — mirrors ProfileDetailsPage getGalleryImages fallbackImages
  let fallbackImages = [];
  if (role === "medical" || role === "clinic") {
    fallbackImages = [primaryImage, "/images/Clinic.png", "/images/profile.png", "/images/ImageHandler.png"];
  } else if (role === "school") {
    fallbackImages = [primaryImage, "/images/School.png", "/images/csc-campus-view.jpg", "/images/home 1.png"];
  } else if (role === "sport") {
    const l = [user.sport_center_name, user.sport_center_type].filter(Boolean).join(" ").toLowerCase();
    if (l.includes("ahly")) {
      fallbackImages = ["/images/Al_Ahly_SC_logo.svg.png", "/images/Al-Ahly-SC-1500x1000.jpg", "/images/Egytennis-el-Ahly-nasrcity-courts-02.png"];
    } else if (l.includes("zamalek")) {
      fallbackImages = ["/images/zamalek.png", "/images/Banner-6.jpg", "/images/Artboard-28.png"];
    } else if (l.includes("wadi") || l.includes("degla")) {
      fallbackImages = ["/images/Wadi Debla.jpg", "/images/Banner-6.jpg", "/images/747.png"];
    } else {
      fallbackImages = [primaryImage, "/images/Egytennis-el-Ahly-nasrcity-courts-02.png", "/images/csc-campus-view.jpg", "/images/Banner-6.jpg"];
    }
  }

  const imageSrcs = [...new Set([...explicitImages, ...fallbackImages].filter(Boolean))].slice(0, 5);

  const imageItems = imageSrcs.map((src, i) => ({
    _id: `s-img-${i}`,
    type: "image",
    src,
    _isService: true,
  }));

  // Sample video — always shown on the Details page, so always include here
  const videoItem = {
    _id: "s-vid-0",
    type: "video",
    src: SAMPLE_VIDEO_SRC,
    name: "Service video",
    _isService: true,
  };

  return [...imageItems, videoItem];
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const router = useRouter();

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setFormData(res.data.profile);
    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        apiUrl("/api/profile/update"),
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 نعمل refetch عشان نضمن التحديث
      await fetchProfile();

      alert("Updated successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error while saving ❌");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ================= LOADING =================
  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile data</div>;

  const user = profile.profile;
  const role = profile.role;
  const mediaKey = getMediaKey(role, user);
  const serviceImage = getServiceImage(role, user, apiUrl);
  const computedMedia = buildComputedMediaForEdit(role, user, apiUrl);

  console.log("Profile data:", profile);
  console.log("Logged in user:", user);
  console.log("User role:", role);
  console.log("Service image:", serviceImage);

  // ================= GET NAME =================
  const getName = () => {
    if (role === "parent") return user.name;
    if (role === "school") return user.school_name;
    if (role === "sport") return user.sport_center_name;
    if (role === "clinic" || role === "medical") return user.clinic_name;
    return "User";
  };

  return (
    <div className="profile">
      <div className="profile-inner">

        {/* ================= TOP CARD ================= */}
        <ProfileHeader
          user={profile.profile}
          role={profile.role}
          setProfile={setProfile}
          serviceImage={serviceImage}
          onEditClick={() => {
            console.log("Current profile:", profile.profile);
            setEditMode(true);
          }}
        />

        {/* ================= ROLE COMPONENT ================= */}
        {role === "school" && (
          <SchoolProfile
            user={user}
            formData={formData}
            setFormData={setFormData}
            handleSave={handleSave}
          />
        )}

        {role === "parent" && (
          <ParentProfile
            user={user}
            formData={formData}
            setFormData={setFormData}
            handleSave={handleSave}
          />
        )}

        {role === "sport" && (
          <SportProfile
            user={user}
            formData={formData}
            setFormData={setFormData}
            handleSave={handleSave}
          />
        )}

        {(role === "clinic" || role === "medical") && (
          <ClinicProfile
            user={user}
            formData={formData}
            setFormData={setFormData}
            handleSave={handleSave}
          />
        )}

        {/* ================= MEDIA SECTION (providers only) ================= */}
        {mediaKey && <ProviderMediaSection mediaKey={mediaKey} />}

        {/* ================= LOGOUT ================= */}
        <div className="logout">
          <button onClick={handleLogout}>Logout</button>
        </div>

      </div>

      {/* ================= EDIT PANEL (outside profile-inner, fixed overlay) ================= */}
      {editMode && (
        <EditProfilePanel
          user={profile.profile}
          role={profile.role}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditMode(false)}
          setProfile={setProfile}
          mediaKey={mediaKey}
          serviceImage={serviceImage}
          computedMedia={computedMedia}
          onSaveSuccess={() => {
            fetchProfile();
            setEditMode(false);
          }}
        />
      )}
    </div>
  );
}
