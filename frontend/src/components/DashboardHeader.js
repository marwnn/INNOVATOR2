import React, { useState } from "react";
import { FaSearch, FaBell, FaSignOutAlt, FaTrashAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css";

const DashboardHeader = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Get user data from local storage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { name, role, profilePic } = user;

  // ✅ Logout Function
const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  // ✅ Delete Account Function
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Account deleted successfully!");
        localStorage.clear();
        navigate("/");
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (error) {
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="dashboard-header">
      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>

      {/* Notifications & Profile */}
      <div className="header-right">
        {/* Notification Button */}
        <button className="notification-btn">
          <FaBell />
        </button>

        {/* Profile Section */}
        <div className="profile-section" onClick={() => setOpen(!open)}>
          <img src={profilePic || "/default-profile.png"} alt="Profile" className="profile-pic" />
          <div className="user-info">
            <span className="user-name">{name || "User"}</span>
            <small className="user-role">{role || "Unknown Role"}</small>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="dropdown">
          <ul>
            <li onClick={() => navigate("/profile")}>
              <FaUser className="icon" /> Profile
            </li>
           
            <li onClick={handleDeleteAccount} className="delete">
              <FaTrashAlt className="icon" /> Delete Account
            </li>
             <li onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
