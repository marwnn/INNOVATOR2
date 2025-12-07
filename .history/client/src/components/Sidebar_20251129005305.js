import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import Logo from "../assets/logo.png";
import "../styles/Sidebar.css";

import { FaXmark, FaBars } from "react-icons/fa6";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // open by default
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // close sidebar after clicking any menu item
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      axios
        .post("http://localhost:5000/logout", {}, { headers })
        .finally(() => {
          sessionStorage.clear();
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
          navigate("/");
        });
    }
  };

  const homePath =
    user?.role === "admin" ? "/dashboard/admin" : "/dashboard/parent";

  return (
    <>
      {/* Toggle Button (small screens) */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaXmark /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* (optional) logo area */}
        {/* <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
          <span>Pateros Technological College</span>
        </div> */}

        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          <h3 className="menu-title">Menu</h3>

          <Link
            to={homePath}
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <MapsHomeWorkOutlinedIcon className="icon" /> Home
          </Link>

          <Link
            to="/dashboard/students"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <LibraryBooksOutlinedIcon className="icon" /> Student List
          </Link>

          <Link
            to="/dashboard/subjects"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <MenuBookOutlinedIcon className="icon" /> Subjects
          </Link>

          <Link
            to="/dashboard/grades"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <SchoolOutlinedIcon className="icon" /> Grades
          </Link>

          <Link
            to="/dashboard/attendance"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <ChecklistOutlinedIcon className="icon" /> Attendance Record
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/dashboard/activity-logs"
              className="sidebar-item"
              onClick={closeSidebar}
            >
              <EventNoteOutlinedIcon className="icon" /> Activity Logs
            </Link>
          )}

          <Link
            to="/dashboard/announcements"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <CampaignOutlinedIcon className="icon" /> Announcements
          </Link>

          <Link
            to="/dashboard/messages"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <SmsOutlinedIcon className="icon" /> Messages
          </Link>
        </div>

        {/* Other Section at Bottom */}
        <div className="sidebar-other">
          <h3 className="menu-title">Other</h3>

          <Link
            to="/profile"
            className="sidebar-item"
            onClick={closeSidebar}
          >
            <AccountCircleOutlinedIcon className="icon" /> Profile
          </Link>

          <button
            style={{ margin: "0 0 20px 1px" }}
            className="sidebar-item logout-btn"
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
          >
            <LogoutIcon /> Log out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
