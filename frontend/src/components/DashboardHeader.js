import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import "./DashboardHeader.css";

const DashboardHeader = () => {
  const [open, setOpen] = useState(false);
  const [openNotif, setOpenNotif]= useState(false)
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
     // Get user data from local storage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { name, role, profilePic } = user;

const homePath = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/parent";
  const menuItems = [
    { name: "Home", path: {homePath}},
    { name: "Subjects", path: "/subjects"},
    { name: "Schedule", path: "/schedule"},
    { name: "Grades", path: "/grades" },
    { name: "Attendance Record", path: "/attendance" },
    { name: "Announcements", path: "/announcements"},
    { name: "Events", path: "/events"},
    { name: "Messages", path: "/messages" },
    { name: "Profile", path: "/profile"},
    { name: "Help", path: "/help"},
    { name: "Settings", path: "/settings" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  

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
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownVisible(e.target.value.length > 0);
          }}
        />
        {isDropdownVisible && (
          <div className="search-dropdown">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="search-item"
                  onClick={() => { setSearchTerm("")
                    setIsDropdownVisible(false);
                  }
                  }
                >
                  {item.name}
                </Link>
              ))
            ) : (
              <p className="no-results">No matches found</p>
            )}
          </div>
        )}
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
