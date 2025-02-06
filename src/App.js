import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import StudentGrades from './StudentGrades'; // Import the StudentGrades component
import CompetencyManagement from './CompetencyManagement';

// CompetencyGradesChart component
function CompetencyGradesChart() {
  const [competencies, setCompetencies] = useState([]);
  const [grades, setGrades] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    axios.get('http://localhost:8080/competency-grades')
      .then(response => {
        const data = response.data;
        setCompetencies(Object.keys(data)); // Competency names
        setGrades(Object.values(data)); // Average grades
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Render the bar chart
  useEffect(() => {
    if (competencies.length > 0 && grades.length > 0) {
      const ctx = document.getElementById('competencyChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: competencies,
          datasets: [{
            label: 'Competency Grades',
            data: grades,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Grade (out of 100)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Competencies'
              }
            }
          }
        }
      });
    }
  }, [competencies, grades]);

  return (
    <div style={{ width: '75%', margin: 'auto' }}>
      <h1>Competency Grades Bar Chart</h1>
      <canvas id="competencyChart"></canvas>
    </div>
  );
}

// Navigation component
function Navigation() {
  return (
    <nav style={{ marginBottom: '20px' }}>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '20px' }}>
        <li>
          <Link to="/student-grades" style={{ textDecoration: 'none', color: 'blue' }}>
            Student Grades
          </Link>
        </li>
        <li>
          <Link to="/competency-management" style={{ textDecoration: 'none', color: 'blue' }}>
            Competency Management
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        {/* Navigation Bar */}
        <Navigation />

        {/* Routes */}
        <Routes>
          {/* Route for Student Grades */}
          <Route path="/student-grades" element={<StudentGrades />} />
          <Route path="/competency-management" element={<CompetencyManagement />} />

          {/* Default route (redirects to Competency Grades Chart) */}
          <Route path="/" element={<CompetencyGradesChart />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;