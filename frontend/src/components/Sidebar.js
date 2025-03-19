import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, FaBook, FaUserGraduate, FaClipboardList, FaBullhorn, FaEnvelope, FaUser, FaSignOutAlt
} from "react-icons/fa";
import Logo from "../assets/logo.png"; // Ensure your logo is in `src/assets/`
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
   // ✅ Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/");
    }
  };

   const homePath = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/parent";
  return (
    <div className="sidebar">
      {/* Logo & School Name Section */}
      <div className="sidebar-logo">
        <img style={{ width: "40px"}} src={Logo} alt="School Logo" className="logo" />
        <span className="school-name">Don Bosco College</span>
      </div>
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu">
         <h3 className="menu-title">Menu</h3> 
         <Link to={homePath} className="sidebar-item">
          <FaHome className="icon" /> Home
        </Link>
        <Link to="/subjects" className="sidebar-item">
          <FaBook className="icon" /> Subjects 
        </Link>
         <Link to="/schedule" className="sidebar-item">
          <FaBook className="icon" />Schedule
        </Link>
        <Link to="/grades" className="sidebar-item">
          <FaUserGraduate className="icon" /> Grades
        </Link>
        <Link to="/attendance" className="sidebar-item">
          <FaClipboardList className="icon" /> Attendance Record
        </Link>
        <Link to="/announcements" className="sidebar-item">
          <FaBullhorn className="icon" /> Announcements 
        </Link>
         <Link to="/events" className="sidebar-item">
          <FaBullhorn className="icon" />Events
        </Link>
        <Link to="/messages" className="sidebar-item">
          <FaEnvelope className="icon" /> Messages
        </Link>
      </div>

        {/* Other Section at Bottom */}
      <div className="sidebar-other">
        <h3 className="menu-title">Other</h3>
       <Link to="/profile" className="sidebar-item">
  <FaUser className="icon" /> Profile
</Link>

        <Link to="/help" className="sidebar-item">
          <FaClipboardList className="icon" /> Help
        </Link>
        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

