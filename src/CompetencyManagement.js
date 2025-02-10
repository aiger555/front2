import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CompetencyManagement.css';

function CompetencyManagement() {
  const [uniqueCompetences, setUniqueCompetences] = useState([]);
  const [sharedCompetences, setSharedCompetences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newCompetence, setNewCompetence] = useState({ name: '', type: 'unique' });
  const [courseAssignments, setCourseAssignments] = useState({ unique: {}, shared: {} });
  const navigate = useNavigate();

  // Fetch all unique and shared competences, courses, and their assignments
  useEffect(() => {
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    if (!token) {
      alert('You are not authorized. Please log in.');
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    fetchCompetences(token);
    fetchCourses(token);
  }, [navigate]);

  const fetchCompetences = async (token) => {
    try {
      const uniqueResponse = await axios.get('http://localhost:8080/unique-competences', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      const sharedResponse = await axios.get('http://localhost:8080/shared-competences', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      setUniqueCompetences(uniqueResponse.data);
      setSharedCompetences(sharedResponse.data);

      // Fetch course assignments for unique competences
      const uniqueAssignments = {};
      for (const competence of uniqueResponse.data) {
        const assignmentResponse = await axios.get(
          `http://localhost:8080/course-unique-competences?uniqueCompetenceId=${competence.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        );
        uniqueAssignments[competence.id] = assignmentResponse.data;
      }

      // Fetch course assignments for shared competences
      const sharedAssignments = {};
      for (const competence of sharedResponse.data) {
        const assignmentResponse = await axios.get(
          `http://localhost:8080/course-shared-competences?sharedCompetenceId=${competence.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        );
        sharedAssignments[competence.id] = assignmentResponse.data;
      }

      setCourseAssignments({ unique: uniqueAssignments, shared: sharedAssignments });
    } catch (error) {
      console.error('Error fetching competences:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token'); // Remove the token
        navigate('/login'); // Redirect to login
      }
    }
  };

  const fetchCourses = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/courses', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token'); // Remove the token
        navigate('/login'); // Redirect to login
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompetence({ ...newCompetence, [name]: value });
  };

  // Add a new competence (unique or shared)
  const addCompetence = async () => {
    const token = localStorage.getItem('token'); // Get the JWT token
    if (!token) {
      alert('You are not authorized. Please log in.');
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    try {
      const endpoint = newCompetence.type === 'unique'
        ? 'http://localhost:8080/unique-competences/create'
        : 'http://localhost:8080/shared-competences/create';
      const response = await axios.post(
        endpoint,
        { name: newCompetence.name },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );
      fetchCompetences(token); // Refresh the list
      setNewCompetence({ name: '', type: 'unique' }); // Reset form
      alert('Competence added successfully!');
    } catch (error) {
      console.error('Error adding competence:', error);
      alert('Failed to add competence.');
    }
  };

  // Delete a competence (unique or shared)
  const deleteCompetence = async (id, type) => {
    const token = localStorage.getItem('token'); // Get the JWT token
    if (!token) {
      alert('You are not authorized. Please log in.');
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    try {
      const endpoint = type === 'unique'
        ? `http://localhost:8080/unique-competences/delete/${id}`
        : `http://localhost:8080/shared-competences/delete/${id}`;
      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      fetchCompetences(token); // Refresh the list
      alert('Competence deleted successfully!');
    } catch (error) {
      console.error('Error deleting competence:', error);
      alert('Failed to delete competence.');
    }
  };

  // Assign a competence to a course
  const assignCompetenceToCourse = async (competenceId, type) => {
    const token = localStorage.getItem('token'); // Get the JWT token
    if (!token) {
      alert('You are not authorized. Please log in.');
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    if (!selectedCourseId) {
      alert('Please select a course first.');
      return;
    }

    try {
      const endpoint = type === 'unique'
        ? `http://localhost:8080/course-unique-competences/create?courseId=${selectedCourseId}&uniqueCompetenceId=${competenceId}`
        : `http://localhost:8080/course-shared-competences/create?courseId=${selectedCourseId}&sharedCompetenceId=${competenceId}`;
      await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );
      fetchCompetences(token); // Refresh the list to show the new assignment
      alert('Competence assigned to course successfully!');
    } catch (error) {
      console.error('Error assigning competence:', error);
      alert('Failed to assign competence to course.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    navigate('/login'); // Redirect to login page
  };

  // Redirect to StudentGrades page
  const redirectToStudentGrades = () => {
    navigate('/student-grades');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Competency Management</h1>

      {/* Add New Competence Form */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Add New Competence</h2>
        <input
          type="text"
          name="name"
          placeholder="Competence Name"
          value={newCompetence.name}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <select
          name="type"
          value={newCompetence.type}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="unique">Unique Competence</option>
          <option value="shared">Shared Competence</option>
        </select>
        <button onClick={addCompetence} style={{ padding: '5px 10px' }}>Add Competence</button>
      </div>

      {/* Assign Competence to Course */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Assign Competence to Course</h2>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="">Select a Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* List of Unique Competences */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Unique Competences</h2>
        <ul>
          {uniqueCompetences.map((competence) => (
            <li key={competence.id} style={{ marginBottom: '10px' }}>
              {competence.name}
              <button
                onClick={() => deleteCompetence(competence.id, 'unique')}
                style={{ marginLeft: '10px', padding: '2px 5px' }}
              >
                Delete
              </button>
              <button
                onClick={() => assignCompetenceToCourse(competence.id, 'unique')}
                style={{ marginLeft: '10px', padding: '2px 5px' }}
              >
                Assign to Course
              </button>
              <div>
                <strong>Assigned to Courses:</strong>
                {courseAssignments.unique[competence.id]?.map((assignment) => (
                  <div key={assignment.courseId}>
                    {courses.find(course => course.id === assignment.courseId)?.name}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* List of Shared Competences */}
      <div>
        <h2>Shared Competences</h2>
        <ul>
          {sharedCompetences.map((competence) => (
            <li key={competence.id} style={{ marginBottom: '10px' }}>
              {competence.name}
              <button
                onClick={() => deleteCompetence(competence.id, 'shared')}
                style={{ marginLeft: '10px', padding: '2px 5px' }}
              >
                Delete
              </button>
              <button
                onClick={() => assignCompetenceToCourse(competence.id, 'shared')}
                style={{ marginLeft: '10px', padding: '2px 5px' }}
              >
                Assign to Course
              </button>
              <div>
                <strong>Assigned to Courses:</strong>
                {courseAssignments.shared[competence.id]?.map((assignment) => (
                  <div key={assignment.courseId}>
                    {courses.find(course => course.id === assignment.courseId)?.name}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Buttons for Logout and Redirect to StudentGrades */}
      <div>
        <button onClick={redirectToStudentGrades} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Go to Student Grades
        </button>
        <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default CompetencyManagement;