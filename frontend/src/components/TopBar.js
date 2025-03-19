import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css"; // ✅ Ensure this file exists

const TopBar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="top-bar">
      <div className="profile-container">
        <img src={user?.profilePic || "/default-profile.png"} alt="Profile" className="profile-pic" />
        <span>{user?.name} ({user?.role})</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TopBar;
