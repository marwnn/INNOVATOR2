import React from "react";
import "../styles/MissionVision.css";

const MissionVision = () => {
  return (
    <div className="mv-wrapper">
      <h1 className="mv-title">ABOUT US</h1>
      <div className="mv-motto">Empowering futures. Building community.</div>

      {/* VISION / MISSION / CORE VALUES CARDS */}
      <div className="mv-sections">
        <section className="mv-section">
          <h2 className="mv-heading">Vision</h2>
          <p className="mv-text">
            Pateros Technological College envisions itself as a premier institution
            committed to excellence in technological education, producing globally
            competitive and socially responsible graduates.
          </p>
        </section>

        <section className="mv-section">
          <h2 className="mv-heading">Mission</h2>
          <p className="mv-text">
            The mission of Pateros Technological College is to provide quality
            technological and professional education that fosters innovative
            thinking, skills development, and lifelong learning—empowering students
            to meaningfully contribute to society and the global community.
          </p>
        </section>

        <section className="mv-section">
          <h2 className="mv-heading">Core Values</h2>
          <ul className="mv-list">
            <li>Responsibility</li>
            <li>Creativity</li>
            <li>Integrity</li>
            <li>Commitment</li>
            <li>Compassion</li>
            <li>Excellence</li>
            <li>Environmental Concern</li>
          </ul>
        </section>
      </div>

      {/* WHO WE ARE – HERO SECTION (nasa baba na) */}
      <section className="mv-hero">
        <div className="mv-hero-text">
          <h2 className="mv-heading mv-hero-heading">Who We Are</h2>
          <p className="mv-text">
            Established in 2001, Pateros Technological College is a technology-focused institution
            dedicated to accessible, industry-relevant education and strong community partnerships.
          </p>
        </div>

        {/* 20+ YEARS CARD UNDER WHO WE ARE */}
        
      </section>
    </div>
  );
};

export default MissionVision;