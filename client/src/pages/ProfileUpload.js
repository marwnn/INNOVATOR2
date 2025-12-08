import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import "../styles/ProfileUpload.css";

const ProfileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    setUploading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "/"; // palitan kung iba login route mo
        return;
      }

      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await axios.post(
        `${API_BASE}/upload-profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.profilePic) {
        const updatedProfilePic = response.data.profilePic;

        const user = JSON.parse(sessionStorage.getItem("user")) || {};
        const updatedUser = { ...user, profilePic: updatedProfilePic };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        onUploadSuccess(updatedProfilePic);

        alert("Profile picture updated!");
        window.location.reload();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Unauthorized / session expired. Please log in again.");
        sessionStorage.clear();
        window.location.href = "/"; // palitan kung iba login route mo
      } else {
        console.error("Upload error:", error);
        alert("Upload failed!");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-upload">
      <input type="file" onChange={handleFileChange} />
      <button className="uploadPfp" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Profile Picture"}
      </button>
    </div>
  );
};

export default ProfileUpload;
