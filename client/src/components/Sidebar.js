import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from "../assets/logo.png"; // Ensure your logo is in `src/assets/`
import "../styles/Sidebar.css";
import { FaXmark, FaBars} from "react-icons/fa6";
import { FaIconName } from "react-icons/fa6";


const Sidebar = () => {
   const [isOpen, setIsOpen] = useState(true); //  Open by default on large screens
 
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }



  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
   // ✅ Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      sessionStorage.clear();
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
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
       
       
        
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu">
         <h3 className="menu-title">Menu</h3> 
         <Link to={homePath} className="sidebar-item">
          <MapsHomeWorkOutlinedIcon className="icon" /> Home
        </Link>
        <Link to="/dashboard/students" className="sidebar-item">
          <LibraryBooksOutlinedIcon className="icon" /> StudentList 
        </Link>
         <Link to="/dashboard/schedule" className="sidebar-item">
          <EventNoteOutlinedIcon className="icon" />Schedule
        </Link>
        <Link to="/dashboard/grades"className="sidebar-item">
          <SchoolOutlinedIcon className="icon" /> Grades
        </Link>
        <Link to="/dashboard/attendance" className="sidebar-item">
          <ChecklistOutlinedIcon className="icon" /> Attendance Record
        </Link>
        <Link to="/dashboard/announcements" className="sidebar-item">
          <CampaignOutlinedIcon className="icon" /> Announcements 
        </Link>
         <Link to="/dashboard/events" className="sidebar-item">
          <CalendarTodayOutlinedIcon className="icon" />Events
        </Link>
        <Link to= "/dashboard/messages"  className="sidebar-item">
          <SmsOutlinedIcon  className="icon" /> Messages
        </Link>
      </div>

        {/* Other Section at Bottom */}
      <div className="sidebar-other">
        <h3 className="menu-title">Other</h3>
       <Link to="/profile" className="sidebar-item">
  <AccountCircleOutlinedIcon className="icon" /> Profile
</Link>

<button style={{ margin: "0 0 20px 1px" }} className="sidebar-item logout-btn" onClick={handleLogout}>
  <LogoutIcon /> Log out
</button>
</div>
</div>
</>
);
};


export default Sidebar;

