import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "../styles/AuthPage.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";

import Logo from "../assets/logo.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", contactNumber:"" }); 
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Sending Data:", formData);

  try {
    const url = isLogin ? "http://localhost:5000/login" : "http://localhost:5000/register";
    const updatedFormData = isLogin ? formData : { ...formData, role: "parent"};

    const response = await axios.post(url, updatedFormData);
    console.log("Received Data from Backend:", response.data); 

    if (!isLogin) {
  
      alert(response.data.message);
      setIsLogin(true); 
      return;
    }

    //  Process login response
    const {id, token, name, role, email, contactNumber, profilePic } = response.data;
    if (!name || !role) {
      alert("Error: User data missing in response! Check your backend.");
      return;
    }
   
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify({id, name, role, email, contactNumber, profilePic: profilePic || "/default-profile.png" }));

    console.log(" Stored User in sessionStorage:", sessionStorage.getItem("user"));

    
    if (role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/parent");
    }
  } catch (error) {
    alert(error.response?.data?.error || "Something went wrong! Please try again.");
  }
};


  return (
    <div className="auth-container">
      <div className="left-section">
        <h2 className="title">CLASSROOM CONNECT SYSTEM</h2>
        <img style={ { width: "120px"}} src={Logo} alt="School Logo" className="logo" />
        <div className="db">
          <h1>PATEROS TECHNOLOGICAL COLLEGE</h1>
          <p>BSIT_3I</p>
        </div>
      </div>

      <div className="right-section">
        <h2 className="sign">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name (Only in Register Form) */}
          {!isLogin && (
            <>
            <div className="input-container">
              <i className="fas fa-user"></i>
              <input type="text" name="name" placeholder="Full Name (e.g., Juan A. Dela Cruz)" onChange={handleChange} required />
            </div>
             <div className="input-container">
             <i className="fas fa-phone"></i>
            <input type="text" name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
              </div>
          </>)}
          
          {/* Email Field */}
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          </div>

          {/* Password Field */}
          <div className="input-container">
            <i className="fas fa-lock"></i>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>

          {/* Submit Button */}
          <button className="submit" type="submit">
            <i className={isLogin ? "fas fa-sign-in-alt" : "fas fa-user-plus"}></i> {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {isLogin ? (
          <p className="create">
            Don't have an account yet? <br />
            <button className="beforereg" onClick={() => setIsLogin(false)}>Register Here</button>
          </p>
        ) : (
          <p className="ready">
            Already have an account? <br />
            <button className="beforelog" onClick={() => setIsLogin(true)}>Login</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
