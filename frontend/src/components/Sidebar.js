import React, {useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from "../assets/logo.png"; // Ensure your logo is in `src/assets/`
import "./Sidebar.css";
import { 
   FaXmark, FaBars} from "react-icons/fa6";

const Sidebar = () => {
   const [isOpen, setIsOpen] = useState(false); // ✅ Open by default on large screens
 
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }



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
<>
    {/* ✅ Toggle Button (Only Shows on Small Screens) */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaXmark /> : <FaBars />}
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo & School Name Section */}
       
        <div className="sidebar-logo">
          <Link to={homePath} >
            <img style={{ width: "40px" }} src={Logo} alt="School Logo" className="logo" />
            </Link>
        <span className="school-name">Don Bosco College</span>
        </div>
        
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu">
         <h3 className="menu-title">Menu</h3> 
         <Link to={homePath} className="sidebar-item">
          <MapsHomeWorkOutlinedIcon className="icon" /> Home
        </Link>
        <Link to="/subjects" className="sidebar-item">
          <LibraryBooksOutlinedIcon className="icon" /> Subjects 
        </Link>
         <Link to="/schedule" className="sidebar-item">
          <EventNoteOutlinedIcon className="icon" />Schedule
        </Link>
        <Link to="/grades" className="sidebar-item">
          <SchoolOutlinedIcon className="icon" /> Grades
        </Link>
        <Link to="/attendance" className="sidebar-item">
          <ChecklistOutlinedIcon className="icon" /> Attendance Record
        </Link>
        <Link to="/announcements" className="sidebar-item">
          <CampaignOutlinedIcon className="icon" /> Announcements 
        </Link>
         <Link to="/events" className="sidebar-item">
          <CalendarTodayOutlinedIcon className="icon" />Events
        </Link>
        <Link to="/messages" className="sidebar-item">
          <ChatBubbleOutlineOutlinedIcon  className="icon" /> Messages
        </Link>
      </div>

        {/* Other Section at Bottom */}
      <div className="sidebar-other">
        <h3 className="menu-title">Other</h3>
       <Link to="/profile" className="sidebar-item">
  <AccountCircleOutlinedIcon className="icon" /> Profile
</Link>

        <Link to="/help" className="sidebar-item">
          <HelpOutlineOutlinedIcon className="icon" /> Help
          </Link>
          <Link to="/settings" className="sidebar-item">
          <SettingsOutlinedIcon className="icon" /> Settings
          </Link>
          <button style={{ margin: "0 0 20px 1px" }} className="sidebar-item logout-btn" onClick={handleLogout}>
        <LogoutIcon/> Log out 
        </button>
      </div>
    </div>
  </>);
};

export default Sidebar;

