import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileUpload from "./ProfileUpload";
import "../styles/Profile.css";
import ClearIcon from "@mui/icons-material/Clear";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user from sessionStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({
        name: "Unknown",
        role: "Unknown",
        email: "N/A",
        contactNumber: "N/A",
        profilePic: "/default-profile.png",
      });
    }
  }, []);

  // Called after successful upload (no axios here para iwas doble call)
  const handleUploadSuccess = (newProfilePic) => {
    if (!user) return;

    const updatedUser = { ...user, profilePic: newProfilePic };
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const goBackToDashboard = () => {
    if (user?.role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/parent");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <p className="profile-title">My Profile</p>
        <button className="exit-btn" onClick={goBackToDashboard}>
          <ClearIcon className="exitIcon" />
        </button>
      </div>

      <div className="profile-center">
        <img
          src={user?.profilePic || "/default-profile.png"}
          alt="Profile"
          className="profile-pic-large"
        />
      </div>

      <div className="info">
        <div className="info-row">
          Name: <span>{user?.name || "Unknown"}</span>
        </div>
        <div className="info-row">
          Email address: <span>{user?.email || "N/A"}</span>
        </div>
        <div className="info-row">
          Contact number: <span>{user?.contactNumber || "N/A"}</span>
        </div>
      </div>

      <ProfileUpload onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default Profile;