import Link from "next/link";

const ProfileCard = ({ item }) => {
  return (
    <div
      className={`school-card ${item.cardClassName || ""}`.trim()}
      data-type={item.type || ""}
      data-diagnoses={
        Array.isArray(item.diagnoses) ? item.diagnoses.join(",") : item.diagnoses || ""
      }
      data-age={
        Array.isArray(item.ageGroups) ? item.ageGroups.join(",") : item.ageGroups || ""
      }
      data-budget={item.budget ?? ""}
      data-distance={item.distance ?? ""}
    >
      <div className="card-header">
        <div className="logo-container">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <div className="placeholder-logo">No Logo</div>
          )}
        </div>

        <h3 className="school-title">{item.name}</h3>
        <p className="sport-subtitle">{item.typeLabel || "N/A"}</p>
      </div>

      <div className="card-body">
        <div className="school-info card-info">
          <p>
            <strong>Type:</strong> {item.typeLabel || "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {item.location || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {item.phone || "N/A"}
          </p>
        </div>

        <div className="card-actions">
          <button className="btn secondary" type="button">
            View Details
          </button>
          <Link className="action-link" href={item.appointmentHref}>
            <button className="btn primary" type="button">
              Book Appointment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
