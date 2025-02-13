import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import Login from "./Login";
import Register from "./Register";
import StudentGrades from "./StudentGrades";
import CompetencyManagement from "./CompetencyManagement";
import CoursesCompetencies from "./CoursesCompetencies";

// Load API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Optional: Validate token with the backend
      axios
        .get(`${API_URL}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/student-grades" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/student-grades" /> : <Register />} />

        {/* Protected Routes */}
        <Route path="/student-grades" element={isAuthenticated ? <StudentGrades /> : <Navigate to="/login" />} />
        <Route path="/competency-management" element={isAuthenticated ? <CompetencyManagement /> : <Navigate to="/login" />} />
        <Route path="/courses-competencies" element={<CoursesCompetencies />} />

        {/* Redirect to Login if no route matches */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
