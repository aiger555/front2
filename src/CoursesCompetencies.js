import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CoursesCompetencies() {
  const [courses, setCourses] = useState([]);
  const [uniqueCompetencies, setUniqueCompetencies] = useState([]);
  const [sharedCompetencies, setSharedCompetencies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching courses...");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      navigate("/login");
      return;
    }

    fetchCoursesWithCompetencies(token);
    fetchUniqueCompetencies(token);
    fetchSharedCompetencies(token);
  }, [navigate]);

  const fetchCoursesWithCompetencies = async (token) => {
    try {
      // Fetch all courses
      const coursesResponse = await axios.get("http://localhost:8080/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesData = coursesResponse.data;

      // Fetch competencies for each course
      const updatedCourses = await Promise.all(
        coursesData.map(async (course) => {
          const uniqueCompetencesRes = await axios.get(
            `http://localhost:8080/course-unique-competences?courseId=${course.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const sharedCompetencesRes = await axios.get(
            `http://localhost:8080/course-shared-competences?courseId=${course.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log(`Course ID: ${course.id}`);
          console.log("Unique Competencies Response:", uniqueCompetencesRes.data);
          console.log("Shared Competencies Response:", sharedCompetencesRes.data);

          return {
            ...course,
            uniqueCompetencies: uniqueCompetencesRes.data.map((uc) => uc.uniqueCompetence.id), // Extract uniqueCompetenceId
            sharedCompetencies: sharedCompetencesRes.data.map((sc) => sc.sharedCompetence.id), // Extract sharedCompetenceId
          };
        })
      );

      console.log("Updated courses:", updatedCourses);
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error fetching courses or competencies:", error);
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const fetchUniqueCompetencies = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/unique-competences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Unique competencies loaded:", response.data);
      setUniqueCompetencies(response.data);
    } catch (error) {
      console.error("Error fetching unique competencies:", error);
    }
  };

  const fetchSharedCompetencies = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/shared-competences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Shared competencies loaded:", response.data);
      setSharedCompetencies(response.data);
    } catch (error) {
      console.error("Error fetching shared competencies:", error);
    }
  };

  // Helper function to get competency names by IDs
  const getCompetencyNames = (ids, competencies) => {
    console.log("Getting competency names for IDs:", ids);
    console.log("Available competencies:", competencies);
    return ids
      .map((id) => competencies.find((c) => c.id === id)?.name)
      .filter((name) => name) // Remove undefined values
      .join(", ");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Courses and Competencies</h1>

      {courses.length === 0 ? (
        <p>Loading courses...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Unique Competencies</th>
              <th>Shared Competencies</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>
                  {course.uniqueCompetencies.length > 0
                    ? getCompetencyNames(course.uniqueCompetencies, uniqueCompetencies)
                    : "None"}
                </td>
                <td>
                  {course.sharedCompetencies.length > 0
                    ? getCompetencyNames(course.sharedCompetencies, sharedCompetencies)
                    : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => navigate("/competency-management")}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "	#5C4033",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Back to Competency Management
      </button>
    </div>
  );
}

export default CoursesCompetencies;