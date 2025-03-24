import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css";

const DashboardHeader = () => {
  const [open, setOpen] = useState(false);
  const [openNotif, setOpenNotif]= useState(false)
  const navigate = useNavigate();

  // Get user data from local storage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { name, role, profilePic } = user;

  // Logout Function
const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/");
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
         <div className="notif-section" onClick={() => setOpenNotif(!openNotif)}>
          <button className="notification-btn">
          <NotificationsNoneIcon />
        </button>
        </div>

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
            <li className="pfp"onClick={() => navigate("/profile")}>
              <AccountCircleIcon style={{fontSize:"20px"}} className="headerIcon" /> Profile
            </li>
           
            <li className="settings"onClick={() => navigate("/settings")}>
              <SettingsOutlinedIcon style={{fontSize:"20px"}} className="headerIcon" /> Settings
            </li>
             <li onClick={handleLogout}>
              <LogoutIcon style={{fontSize:"20px"}} className="headerIcon" /> Logout
            </li>
          </ul>
        </div>
      )}

       {openNotif && (
        <div className="notif-dropdown">
          <ul>
            <li >
              Changes
            </li>
           
            <li>
              Messages
            </li>
             <li>
               Announcements
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
