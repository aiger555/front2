import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./StudentGrades.css"; // Import styles

const StudentGrades = () => {
  const [rows, setRows] = useState([{ id: uuidv4(), courseId: "", grade: "" }]);
  const [courses, setCourses] = useState([]); // Store the list of courses from the backend
  const [userInfo, setUserInfo] = useState({ email: "", id: "" }); // Store user information
  const [selectedCourseId, setSelectedCourseId] = useState(""); // Track the selected course for deletion
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch courses and user information when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the JWT token from localStorage
    if (!token) {
      alert("You are not authorized. Please log in.");
      window.location.href = "/login"; // Redirect to login if no token is found
      return;
    }

    // Fetch courses with the JWT token in the headers
    axios
      .get("https://transcript2-c5ec5ab05f1a.herokuapp.com/courses", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      })
      .then((response) => {
        setCourses(response.data); // Set the list of courses
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token"); // Remove the token
          window.location.href = "/login"; // Redirect to login
        }
      });

    // Fetch user information
    axios
      .get("https://transcript2-c5ec5ab05f1a.herokuapp.com/users/me", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      })
      .then((response) => {
        setUserInfo(response.data); // Set user information (email, id)
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }, []);

  // Function to add a new row
  const addRow = () => {
    const newRow = { id: uuidv4(), courseId: "", grade: "" };
    setRows([...rows, newRow]);
  };

  // Function to delete a row
  const deleteRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);

    // Perform DELETE request to remove the grade entry (optional)
    const token = localStorage.getItem("token"); // Get the JWT token
    axios
      .delete(`https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      })
      .then((response) => {
        console.log("Grade entry deleted:", response.data);
      })
      .catch((error) => {
        console.error("Error deleting grade entry:", error);
      });
  };

  // Function to handle input changes (course and grade)
  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);

    const updatedRow = updatedRows[index];

    // Perform PUT request to update the grade if the grade or course changes
    if (field === "grade" && updatedRow.courseId) {
      const token = localStorage.getItem("token"); // Get the JWT token
      axios
        .put(
          `https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/update/${updatedRow.courseId}`,
          updatedRow,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        )
        .then((response) => {
          console.log("Grade updated:", response.data);
        })
        .catch((error) => {
          console.error("Error updating grade:", error);
        });
    }
  };

  // Function to calculate average grade and redirect to another page
  const calculateAverage = () => {
    const validGrades = rows
      .map((row) => (row.grade.trim() ? parseFloat(row.grade) : NaN))
      .filter((grade) => !isNaN(grade));

    if (validGrades.length === 0) {
      alert("Please enter grades to calculate the average!");
      return;
    }

    const average =
      validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
    alert(`Average grade: ${average.toFixed(2)}`);

    // Redirect to another page (for example, bar chart page)
    window.location.href = "https://transcriptfront-62cad49a4e47.herokuapp.com/barChart";
  };

  // Function to create a new course
  const createCourse = () => {
    const courseName = prompt("Enter the name of the new course:");
    if (!courseName) return;

    const newCourse = { name: courseName, grade: 0 }; // Default grade is 0

    // Perform POST request to create a new course
    const token = localStorage.getItem("token"); // Get the JWT token
    axios
      .post("https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/create", newCourse, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      })
      .then((response) => {
        console.log("New course created:", response.data);

        // Add the new course to the courses state to update the dropdown
        setCourses((prevCourses) => [...prevCourses, response.data]);

        // Show success message
        alert("Course created successfully!");
      })
      .catch((error) => {
        console.error("Error creating new course:", error);
        alert("Failed to create course. Please try again.");
      });
  };

  // Function to delete a course along with its grades and assigned competencies
  const deleteCourse = async () => {
    if (!selectedCourseId) {
      alert("Please select a course to delete.");
      return;
    }

    const token = localStorage.getItem("token"); // Get the JWT token
    if (!token) {
      alert("You are not authorized. Please log in.");
      window.location.href = "/login"; // Redirect to login if no token is found
      return;
    }

    try {
      // Perform DELETE request to delete the course
      await axios.delete(`https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/delete/${selectedCourseId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });

      // Remove the deleted course from the courses state
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== selectedCourseId)
      );

      // Remove rows associated with the deleted course
      setRows((prevRows) =>
        prevRows.filter((row) => row.courseId !== selectedCourseId)
      );

      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    window.location.href = "/login"; // Redirect to login page
  };

  // Redirect to Competency Management page
  const redirectToCompetencyManagement = () => {
    navigate("/competency-management"); // Use navigate for internal routing
  };

  return (
    <div className="container">
      {/* Display user information */}
      <div style={{ marginBottom: "20px" }}>
        <h2>User Information</h2>
        <p>Email: {userInfo.email}</p>
        <p>ID: {userInfo.id}</p>
      </div>

      <div id="rows">
        {rows.map((row, index) => (
          <div className="row" key={row.id}>
            {/* Dropdown to select a course */}
            <select
              value={row.courseId}
              onChange={(e) => handleChange(index, "courseId", e.target.value)}
            >
              <option value="">Choose the subject</option>
              {/* Populate dropdown with courses from the backend */}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} {/* Display the course name */}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Grade"
              min="0"
              max="100"
              value={row.grade}
              onChange={(e) => handleChange(index, "grade", e.target.value)}
            />
            <button className="add-btn" onClick={addRow}>
              +
            </button>
            <button className="delete-btn" onClick={() => deleteRow(row.id)}>
              -
            </button>
          </div>
        ))}
      </div>

      <button className="calculate-btn" onClick={calculateAverage}>
        Calculate Average
      </button>
      <button className="create-course-btn" onClick={createCourse}>
        Create New Course
      </button>

      {/* Dropdown to select a course for deletion */}
      <div style={{ margin: "10px" }}>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        >
          <option value="">Select a Course to Delete</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        <button
          onClick={deleteCourse}
          style={{ padding: "5px 10px", backgroundColor: "red", color: "white" }}
        >
          Delete Course
        </button>
      </div>

      {/* Button to redirect to Competency Management page */}
      <button
        className="competency-management-btn"
        onClick={redirectToCompetencyManagement}
        style={{ margin: "10px", padding: "5px 10px" }}
      >
        Go to Competency Management
      </button>

      <div>
        <button className="logout-container" onClick={handleLogout} style={{ padding: "5px 10px" }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentGrades;