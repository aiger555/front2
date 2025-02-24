import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StudentGrades from './StudentGrades';
import CompetencyManagement from './CompetencyManagement';
import CoursesCompetencies from './CoursesCompetencies';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the token is in localStorage when the app loads
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Set authentication state
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/student-grades" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/student-grades" /> : <Register />} />

        {/* Protected Routes */}
        <Route
          path="/student-grades"
          element={isAuthenticated ? <StudentGrades /> : <Navigate to="/login" />}
        />
        <Route
          path="/competency-management"
          element={isAuthenticated ? <CompetencyManagement /> : <Navigate to="/login" />}
        />
        <Route path="/courses-competencies" element={<CoursesCompetencies />} />

        {/* Redirect to Login if no route matches */}
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;
