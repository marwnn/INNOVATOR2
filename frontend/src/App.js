import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ParentDashboard from "./components/ParentDashboard";
import Profile from "./components/Profile"; // Profile Page

// ✅ Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />; // Redirect to login if not logged in
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if role is not allowed
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin", "parent"]} />}>
          <Route path="admin" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
          <Route path="parent" element={<ProtectedRoute element={<ParentDashboard />} allowedRoles={["parent"]} />} />
         </Route>
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} allowedRoles={["admin", "parent"]} />} />
        
      </Routes>
    </Router>
  );
}

export default App;

