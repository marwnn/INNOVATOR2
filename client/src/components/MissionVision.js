import React from "react";
import "../styles/MissionVision.css";

const MissionVision = () => {
  return (
    <div className="mv-container">
      <h1 className="mv-title">MGA ITIK</h1>

      <section className="mv-section">
        <h2 className="mv-heading">Vision</h2>
        <p className="mv-text">
          Pateros Technological College envisions itself as a premier institution committed to excellence in
          technological education, producing globally competitive and socially responsible graduates.
        </p>
      </section>

      <section className="mv-section">
        <h2 className="mv-heading">Mission</h2>
        <p className="mv-text">
          The mission of Pateros Technological College is to provide quality technological and professional
          education that fosters innovative thinking, skills development, and lifelong learning, empowering
          students to contribute meaningfully to society and the global community.
        </p>
      </section>
    </div>
  );
};

export default MissionVision;
