import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "./StudentGrades.css"; // Import styles

const StudentGrades = () => {
  const [rows, setRows] = useState([{ id: uuidv4(), courseId: "", grade: "" }]);
  const [courses, setCourses] = useState([]); // Store the list of courses from the backend

  // Fetch courses from the backend when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:8080/courses")
      .then((response) => {
        setCourses(response.data); // Set the list of courses
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
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

    // Perform DELETE request to remove the grade entry
    axios
      .delete(`http://localhost:8080/courses/delete/${id}`)
      .then((response) => {
        console.log("Grade entry deleted:", response.data);
      })
      .catch((error) => {
        console.error("Error deleting grade entry:", error);
      });
  };

  // Function to handle input changes
  const handleChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);

    const updatedRow = updatedRows[index];

    // Perform PUT request to update the grade
    if (field === "grade" && updatedRow.courseId) {
      axios
        .put(
          'http://localhost:8080/courses/update/${updatedRow.courseId}',
          updatedRow
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
      alert("Введите оценки для расчета!");
      return;
    }

    const average =
      validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
    alert(`Средний балл: ${average.toFixed(2)}`);

    // Перенаправление на другой URL
    window.location.href = "http://localhost:8080/barChart";
  };

  // Function to create a new course
  const createCourse = () => {
    const courseName = prompt("Enter the name of the new course:");
    if (!courseName) return;

    const newCourse = { name: courseName, grade: 0 }; // Default grade is 0

    // Perform POST request to create a new course
    axios
      .post("http://localhost:8080/courses/create", newCourse)
      .then((response) => {
        console.log("New course created:", response.data);
        setCourses([...courses, response.data]); // Add the new course to the list
      })
      .catch((error) => {
        console.error("Error creating new course:", error);
      });
  };

return (
    <div className="container">
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
              placeholder="grade"
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
        count
      </button>
      <button className="create-course-btn" onClick={createCourse}>
        Create New Course
      </button>
    </div>
  );
};

export default StudentGrades;