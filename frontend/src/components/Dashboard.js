import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import DashboardContent from "../components/DashboardContent";
import { Outlet } from "react-router-dom"; // Allows nested routes to render
import "./Dashboard.css";
const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        
        <DashboardContent />
    <Outlet /> 
      </div>
    </div>
  );
};

export default Dashboard;

