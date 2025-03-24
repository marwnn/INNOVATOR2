import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import "./Settings.css";
import ClearIcon from '@mui/icons-material/Clear';
const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
// ✅ Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({ name: "Unknown", role: "Unknown", profilePic: "/default-profile.png" });
    }
  }, []);


    const goBackToDashboard = () => {
    
        if (user?.role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/parent");
    }
  };

    //  Delete Account Function
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
        
           
        <div className='settingsContainer'>
          <h2>Settings</h2>
             <button onClick={goBackToDashboard} className="back-btn"><ClearIcon className="clearIcon"/></button>
            <br></br>
            <div className='delContainer'>
      <p className="delete"onClick={handleDeleteAccount}>
              <DeleteForeverIcon style={{fontSize:"20px"}} className="headerIcon" /> Delete your account?
              </p>
              </div>
            </div>
           
  )
}

export default Settings
