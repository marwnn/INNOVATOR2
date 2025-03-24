import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileUpload from "../components/ProfileUpload";
import "./Profile.css";
import ClearIcon from '@mui/icons-material/Clear';
const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({ name: "Unknown", role: "Unknown", profilePic: "/default-profile.png" });
    }
  }, []);

  // ✅ Profile Upload Handler
  const handleUploadSuccess = async (newProfilePic) => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", newProfilePic);

      const response = await axios.post(
        "http://localhost:5000/upload-profile-pic",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.profilePic) {
        const updatedUser = { ...user, profilePic: response.data.profilePic };
        
        // ✅ Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Force re-render to display new profile picture
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Profile picture upload failed", error);
    }
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
      <button onClick={goBackToDashboard} className="back-btn"><ClearIcon className="clearIcon"/></button>
      <h2>Profile</h2>
      <img
        key={user?.profilePic} // ✅ Force re-render when profilePic changes
        src={user?.profilePic || "/default-profile.png"}
        alt="Profile"
        className="profile-pic-large"
      />
      <h3>{user?.name || "Unknown"}</h3>
      <p>Role: {user?.role || "Unknown Role"}</p>
      <ProfileUpload onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default Profile;

