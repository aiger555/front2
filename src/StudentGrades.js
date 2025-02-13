import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentGrades.css";

const StudentGrades = () => {
  const [rows, setRows] = useState([{ id: uuidv4(), courseId: "", grade: "" }]);
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState({ email: "", id: "" });
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      window.location.href = "/login";
      return;
    }

    axios
      .get("https://transcript2-c5ec5ab05f1a.herokuapp.com/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });

    axios
      .get("https://transcript2-c5ec5ab05f1a.herokuapp.com/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }, []);

  const addRow = () => {
    const newRow = { id: uuidv4(), courseId: "", grade: "" };
    setRows([...rows, newRow]);
  };

  const deleteRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);

    const token = localStorage.getItem("token");
    axios
      .delete(`https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Grade entry deleted:", response.data);
      })
      .catch((error) => {
        console.error("Error deleting grade entry:", error);
      });
  };

  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);

    const updatedRow = updatedRows[index];

    if (field === "grade" && updatedRow.courseId) {
      const token = localStorage.getItem("token");
      axios
        .put(
          `https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/update/${updatedRow.courseId}`,
          updatedRow,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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

    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = `https://transcript2-c5ec5ab05f1a.herokuapp.com/barChart?token=${token}`;
    } else {
      alert("You are not authorized. Please log in.");
      window.location.href = "/login";
    }
  };

  const createCourse = () => {
    const courseName = prompt("Enter the name of the new course:");
    if (!courseName) return;

    const newCourse = { name: courseName, grade: 0 };

    const token = localStorage.getItem("token");
    axios
      .post("https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/create", newCourse, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("New course created:", response.data);
        setCourses((prevCourses) => [...prevCourses, response.data]);
        alert("Course created successfully!");
      })
      .catch((error) => {
        console.error("Error creating new course:", error);
        alert("Failed to create course. Please try again.");
      });
  };

  const deleteCourse = async () => {
    if (!selectedCourseId) {
      alert("Please select a course to delete.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      window.location.href = "/login";
      return;
    }

    try {
      await axios.delete(`https://transcript2-c5ec5ab05f1a.herokuapp.com/courses/delete/${selectedCourseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== selectedCourseId)
      );

      setRows((prevRows) =>
        prevRows.filter((row) => row.courseId !== selectedCourseId)
      );

      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const redirectToCompetencyManagement = () => {
    navigate("/competency-management");
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "20px" }}>
        <h2>User Information</h2>
        <p>Email: {userInfo.email}</p>
        <p>ID: {userInfo.id}</p>
      </div>

      <div id="rows">
        {rows.map((row, index) => (
          <div className="row" key={row.id}>
            <select
              value={row.courseId}
              onChange={(e) => handleChange(index, "courseId", e.target.value)}
            >
              <option value="">Choose the subject</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
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