import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { Outlet } from "react-router-dom"; // Allows nested routes to render
import "../styles/Dashboard.css";
import QRCode from "react-qr-code";
import axios from "axios";

const Dashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [activeSession, setActiveSession] = useState(null);
  useEffect(() => {
    const tick = () => {
      const raw = sessionStorage.getItem("qrSession");
      if (!raw) return setActiveSession(null);
      try { setActiveSession(JSON.parse(raw)); } catch {}
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const endQrSession = async () => {
    const token = activeSession?.token;
    if (!token) return;
    try {
      await axios.post(`http://localhost:5000/api/attendance/qr-session/${token}/mark-absent`);
      await axios.post(`http://localhost:5000/api/attendance/qr-session/${token}/deactivate`);
    } catch (err) {}
    sessionStorage.removeItem("qrSession");
    setActiveSession(null);
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        {activeSession && user.role === "admin" && new Date(activeSession.expiresAt) > new Date() && (
          <div className="qr-overlay">
            <div className="qr-overlay-content">
              <div className="qr-overlay-title">QR Session Active</div>
              <QRCode value={activeSession.token} size={96} />
              <div className="qr-overlay-exp">Expires: {new Date(activeSession.expiresAt).toLocaleString()}</div>
              <button className="qr-overlay-btn" onClick={endQrSession}>End Session</button>
            </div>
          </div>
        )}
        <DashboardContent />
        <Outlet /> 
      </div>
    </div>
  );
};

export default Dashboard;

