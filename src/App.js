import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StudentGrades from './StudentGrades'; // Import the StudentGrades component
import CompetencyManagement from './CompetencyManagement'; // Import the CompetencyManagement component

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

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

        {/* Redirect to Login if no route matches */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
