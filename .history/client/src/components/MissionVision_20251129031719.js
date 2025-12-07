import React, { useState } from "react";
import "../styles/MissionVision.css";

const MissionVision = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="mv-wrapper">
      <h1 className="mv-title">PTC </h1>
      <div className="mv-motto">Empowering futures. Building community.</div>

      {/* 20+ YEARS BADGE AT THE TOP */}
      <div className="mv-hero-badge-top">
        <span className="mv-hero-badge-main">20+ years</span>
        <span className="mv-hero-badge-sub">of academic excellence</span>
      </div>

      {/* LANDSCAPE CARDS: About PTC / Mission / Core Values */}
      <div className="mv-sections mv-landscape">
        <section className="mv-section">
          <h2 className="mv-heading">About PTC</h2>
          <p className="mv-text">
            Pateros Technological College (PTC) is a technical-vocational school established on January 29, 1993 by virtue of Municipal Ordinance No. 93-07. It started its operation on August 16, 1993, initially offering short term and two-year Associate in Computer Science, Computer Secretarial Science, and Computer Technology courses. Systematrix Computer Education and Services, Inc. (SCESI) became the partner group of PTC through Municipal Resolution No. 64 – 95 authorizing the Municipality of Pateros to sign a Memorandum of Agreement with SCESI.
          </p>
          <p className="mv-text">
            The partnership between PTC and SCESI ended in October, 1995. Keeping up with the goal to continue its technical-vocational advocacy, PTC forged another linkage, this time with the Technological University of the Philippines (TUP). On September 26, 1995, PTC became the recipient of the Adopt-A-School program of TUP through another Memorandum of Agreement. The linkage gave birth to the first four-year Bachelor of Computer Science program in the academic year 1997 – 1998. PTC also became TUP’s ally in the off-campus training of the latter’s undergraduate and graduate students.
          </p>
          <p className="mv-text">
            Because of the linkage, Pateros Technological College gained its institutional footing to stand on its own. This paved the way to offer ladderized scheme programs that lead to Baccalaureate Degrees. The Bachelor of Science in Education, Major in Information System and Minor in Mathematics was offered in SY 2006 – 2007. Then, the Certificate in Hotel and Restaurant Management leading to Bachelor of Science in Hospitality Management and Bachelor of Science in Office Administration were offered the following school year.
          </p>
        </section>

      {/* VISION */}
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
          <ul className="mv-list">
            <li>Provide quality higher education through specialized professional instruction.</li>
            <li>Provide training in scientific, technological, industrial, and vocational fields.</li>
            <li>Enhance moral and spiritual values.</li>
            <li>Instill the love of country and appreciation of the Filipino cultural heritage.</li>
            <li>Promote environmental awareness and unconditional love for Mother Earth.</li>
            <li>Offer educational opportunities especially to marginalized individuals.</li>
            <li>Heighten students’ creativity and leadership through extra- and co-curricular activities.</li>
            <li>Produce quality graduates adept with technological skills and professional education.</li>
          </ul>
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

      {/* FOOTER */}
      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "0.9rem", color: "#e0ffae" }}>
        <span>
          Copyright © 2025 Pateros Technological College. All rights reserved •{' '}
          <button onClick={openModal} className="mv-terms-btn">
            Terms & Conditions
          </button>
        </span>
      </footer>

      {/* MODAL */}
      {isModalOpen && (
        <div className="mv-modal-overlay">
          <div className="mv-modal">
            <button className="mv-modal-close" onClick={closeModal}>×</button>
            <h2 className="mv-heading">Terms & Conditions</h2>
            <div className="mv-modal-content">
              <p><strong>Pateros Technological College 2025 • Interactive Policy</strong></p>
              <p><strong>1. Preamble:</strong> Pateros Technological College is committed to upholding data privacy and security, complying with the Data Privacy Act of 2012.</p>
              <p><strong>2. Data Privacy Officer:</strong> Catherine Peñaverde, dpo@paterostechnologicalcollege.edu.ph</p>
              <p><strong>3. Scope of Application:</strong> Applies to all personal data collected and processed by the College from students, faculty, staff, alumni, visitors, and other stakeholders.</p>
              <p><strong>4. Definition of Personal Data:</strong> Any information that identifies an individual either directly or when combined with other information.</p>
              <p><strong>5. Collection of Personal Data:</strong> Data collected for academic administration, HR management, institutional advancement, security, and legal compliance.</p>
              <p><strong>6. Use and Processing:</strong> Data used for educational services, HR, promotion, security, compliance, and research.</p>
              <p><strong>7. Disclosure & Sharing:</strong> May share data with service providers, government agencies, partner institutions, or authorized third parties.</p>
              <p><strong>8. Data Security Measures:</strong> Encryption, access control, audits, physical security, and breach response plan.</p>
              <p><strong>9. Data Retention Policy:</strong> Retained only as long as necessary, then securely disposed.</p>
              <p><strong>10. Rights of Data Subjects:</strong> Access, rectification, erasure, objection, portability, filing complaints.</p>
              <p><strong>11. Cookies & Similar Technologies:</strong> College website may use cookies. Users can control via browser settings.</p>
              <p><strong>12. Amendments:</strong> College may amend this policy; changes posted on the website.</p>
              <p><strong>13. Consent:</strong> By providing personal data, subjects consent to collection, use, and processing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionVision;