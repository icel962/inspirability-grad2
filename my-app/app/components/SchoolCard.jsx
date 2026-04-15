import Link from "next/link";
import "../styles/school.css";

const SchoolCard = ({ school }) => {
  return (
    <div className="school-card">
      <div className="logo-container">
        {school.school_image ? (
          <img src={school.school_image} alt={school.school_name} />
        ) : (
          <div className="placeholder-logo">No Logo</div>
        )}
      </div>
      <h3 className="school-title">{school.school_name}</h3>
      <div className="school-info">
        <p>
          <strong>Special Type:</strong> {school.special_type || "N/A"}
        </p>
        <p>
          <strong>City:</strong> {school.city || "N/A"}
        </p>
        <p>
          <strong>Annual Fees:</strong>{" "}
          {school.annual_fees ? `${school.annual_fees} EGP` : "N/A"}
        </p>
      </div>
      <Link href={`/appointment?schoolId=${school.school_id}&schoolName=${encodeURIComponent(school.school_name)}`}>
        <button className="details-btn">Book Appointment</button>
      </Link>
    </div>
  );
};

export default SchoolCard;
