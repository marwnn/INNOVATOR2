import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Logo from "../assets/logo.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", contactNumber: "" });
  const [tcAgree, setTcAgree] = useState(false);
  const [ppAgree, setPpAgree] = useState(false);
  const [adminAgree, setAdminAgree] = useState(false);
  const [highlightCheckbox, setHighlightCheckbox] = useState(false);
  const [error, setError] = useState("");
  const [showAgreement, setShowAgreement] = useState(false); // can be "tc" or "pp"
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && (!formData.name?.trim() || !formData.contactNumber?.trim())) {
      setError("Please fill in name and contact number.");
      return;
    }

    if (!isLogin && (!tcAgree || !ppAgree || !adminAgree)) {
      setError("You must agree to Terms, Privacy Policy, and confirm info accuracy.");
      setHighlightCheckbox(true);
      return;
    }

    if (!formData.email?.trim() || !formData.password?.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      const url = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/register";
      const updatedFormData = isLogin
        ? formData
        : { ...formData, role: "parent", tc_agreed: tcAgree, pp_agreed: ppAgree, admin_agreed: adminAgree };

      const response = await axios.post(url, updatedFormData);

      if (!isLogin) {
        alert(response.data.message);
        setIsLogin(true);
        setTcAgree(false);
        setPpAgree(false);
        setAdminAgree(false);
        setHighlightCheckbox(false);
        return;
      }

      const { id, token, name, role, email, contactNumber, profilePic } = response.data;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem(
        "user",
        JSON.stringify({ id, name, role, email, contactNumber, profilePic: profilePic || "/default-profile.png" })
      );

      navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/parent");
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong! Please try again.");
    }
  };

  const closeForm = (e) => {
    if (e.target.classList.contains("auth-form-overlay")) {
      setShowForm(false);
      setError("");
      setTcAgree(false);
      setPpAgree(false);
      setAdminAgree(false);
      setHighlightCheckbox(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Landing */}
      <div className={`landing ${showForm ? "landing-active" : ""}`}>
        <div className="top-left-buttons">
          <button onClick={() => { setShowForm(true); setIsLogin(true); }}>Login</button>
          <button onClick={() => { setShowForm(true); setIsLogin(false); }}>Register</button>
        </div>

        <img src={Logo} alt="Logo" className="landing-logo" />
        <h1 className="landing-title">CLASSROOM CONNECT SYSTEM</h1>
        <h2 className="landing-school">PATEROS TECHNOLOGICAL COLLEGE</h2>
      </div>

      {/* Auth Modal */}
      {showForm && (
        <div className="auth-form-overlay" onClick={closeForm}>
          <div className="auth-form">
            <h2>{isLogin ? "Login" : "Register"}</h2>
            <form onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              {!isLogin && (
                <>
                  <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                  <input type="text" name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
                </>
              )}

              <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

              {!isLogin && (
                <div className="register-extra">
                  {/* Terms & Conditions */}
                  <label className={`agreement-check ${highlightCheckbox && !tcAgree ? "highlight" : ""}`}>
                    <input type="checkbox" checked={tcAgree} onChange={(e) => { setTcAgree(e.target.checked); setHighlightCheckbox(false); }} />
                    <span style={{ marginLeft: 8 }}>
                      I agree to the{" "}
                      <button type="button" className="read-agreement-inline" onClick={() => setShowAgreement("tc")}>
                        Terms & Conditions
                      </button>
                    </span>
                  </label>

                  {/* Privacy Policy */}
                  <label className={`agreement-check ${highlightCheckbox && !ppAgree ? "highlight" : ""}`}>
                    <input type="checkbox" checked={ppAgree} onChange={(e) => { setPpAgree(e.target.checked); setHighlightCheckbox(false); }} />
                    <span style={{ marginLeft: 8 }}>
                      I agree to the{" "}
                      <button type="button" className="read-agreement-inline" onClick={() => setShowAgreement("pp")}>
                        Privacy Policy
                      </button>
                    </span>
                  </label>

                  {/* Info Accuracy */}
                  <label className={`agreement-check ${highlightCheckbox && !adminAgree ? "highlight" : ""}`}>
                    <input type="checkbox" checked={adminAgree} onChange={(e) => { setAdminAgree(e.target.checked); setHighlightCheckbox(false); }} />
                    <span style={{ marginLeft: 8 }}> I hereby confirm that I am duly authorized and that all information provided is true and accurate </span>
                  </label>
                </div>
              )}

              <button type="submit" disabled={!isLogin && !(tcAgree && ppAgree && adminAgree)}>
                {isLogin ? "Login" : "Register"}
              </button>

              <p className="toggle-login">
                {isLogin
                  ? <>Don't have an account? <span onClick={() => setIsLogin(false)}>Register Here</span></>
                  : <>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></>
                }
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="agreement-overlay">
          <div className="agreement-modal">
            <h2>{showAgreement === "tc" ? "Terms & Conditions" : "Privacy Policy"}</h2>
            <div className="agreement-content">
              {showAgreement === "tc" ? (
                <ol>
                  <li>The credentials you provide will be stored and used only for the Classroom Connect System.</li>
                  <li>All information you submit must be accurate and truthful.</li>
                  <li>Improper use of your account may lead to suspension or removal.</li>
                  <li>System is intended only for school-related use.</li>
                  <li>Administrators may approve, reject, or revoke access at any time.</li>
                  <li>No sharing of passwords or impersonation allowed.</li>
                </ol>
              ) : (
                <ol>
                  <li>We collect your personal information for account creation and school communication purposes only.</li>
                  <li>Your data will not be shared with third parties without consent.</li>
                  <li>We implement reasonable measures to protect your data from unauthorized access.</li>
                  <li>You may request data deletion or account removal at any time.</li>
                  <li>Cookies or local storage may be used for session management and system functionality.</li>
                </ol>
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowAgreement(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;
