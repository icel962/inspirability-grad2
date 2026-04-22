import Link from "next/link";
import "../styles/school.css";

const SportCard = ({ sport }) => {
  return (
    <div className="school-card">
      <div className="logo-container">
        {sport.sport_center_image ? (
          <img src={sport.sport_center_image} alt={sport.sport_center_name} />
        ) : (
          <div className="placeholder-logo">No Logo</div>
        )}
      </div>
      <h3 className="school-title">{sport.sport_center_name}</h3>
      <div className="school-info">
        <p>
          <strong>Type:</strong> {sport.sport_center_type || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {sport.location || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {sport.phone_number || "N/A"}
        </p>
      </div>
      <Link href={`/appointment?sportId=${sport.sport_center_id}&sportName=${encodeURIComponent(sport.sport_center_name)}`}>
        <button className="details-btn">Book Appointment</button>
      </Link>
    </div>
  );
};

export default SportCard;
