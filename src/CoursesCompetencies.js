import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CoursesCompetencies() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      navigate("/login");
      return;
    }

    fetchCoursesWithCompetencies(token);
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

          return {
            ...course,
            uniqueCompetencies: uniqueCompetencesRes.data,
            sharedCompetencies: sharedCompetencesRes.data,
          };
        })
      );

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
                    ? course.uniqueCompetencies.map((c) => c.uniqueCompetenceId).join(", ")
                    : "None"}
                </td>
                <td>
                  {course.sharedCompetencies.length > 0
                    ? course.sharedCompetencies.map((c) => c.sharedCompetenceId).join(", ")
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
          backgroundColor: "#007BFF",
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
