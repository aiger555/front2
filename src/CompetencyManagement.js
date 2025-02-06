import { useState, useEffect } from "react";
import axios from "axios";
import "./CompetencyManagement.css";

const CompetencyManager = () => {
  const [uniqueCompetencies, setUniqueCompetencies] = useState([]);
  const [sharedCompetencies, setSharedCompetencies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newCompetency, setNewCompetency] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [competencyType, setCompetencyType] = useState("unique");
  const [assignedCompetencies, setAssignedCompetencies] = useState({}); // { courseId: [competencies] }

  useEffect(() => {
    fetchCompetencies();
    fetchCourses();
  }, []);

  // Fetch all competencies (unique and shared)
  const fetchCompetencies = async () => {
    try {
      const uniqueRes = await axios.get("http://localhost:8080/unique-competences");
      const sharedRes = await axios.get("http://localhost:8080/shared-competences");
      setUniqueCompetencies(uniqueRes.data);
      setSharedCompetencies(sharedRes.data);
    } catch (error) {
      console.error("Ошибка при загрузке компетенций:", error.message);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/courses");
      setCourses(res.data);
      // Fetch assigned competencies for each course
      res.data.forEach((course) => fetchAssignedCompetencies(course.id));
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error.message);
    }
  };

  // Fetch competencies assigned to a specific course
  const fetchAssignedCompetencies = async (courseId) => {
    try {
      const uniqueRes = await axios.get(`http://localhost:8080/course-unique-competences/course/${courseId}`);
      const sharedRes = await axios.get(`http://localhost:8080/course-shared-competences/course/${courseId}`);
      setAssignedCompetencies((prev) => ({
        ...prev,
        [courseId]: [...uniqueRes.data, ...sharedRes.data],
      }));
    } catch (error) {
      console.error("Ошибка при загрузке назначенных компетенций:", error.message);
    }
  };

  // Add a new competency
  const handleAddCompetency = async () => {
    if (!newCompetency) return alert("Введите название компетенции!");

    const endpoint = competencyType === "unique" 
      ? "/unique-competences/create" 
      : "/shared-competences/create";

    try {
      await axios.post(`http://localhost:8080${endpoint}`, { name: newCompetency }, {
        headers: { "Content-Type": "application/json" }
      });
      setNewCompetency("");
      fetchCompetencies();
    } catch (error) {
      console.error("Ошибка при добавлении:", error.message);
      alert("Ошибка при добавлении: " + error.message);
    }
  };

  // Delete a competency
  const handleDeleteCompetency = async (id, type) => {
    const endpoint = type === "unique" 
      ? `/unique-competences/delete/${id}` 
      : `/shared-competences/delete/${id}`;

    try {
      await axios.delete(`http://localhost:8080${endpoint}`);
      fetchCompetencies();
    } catch (error) {
      console.error("Ошибка при удалении:", error.message);
      alert("Ошибка при удалении: " + error.message);
    }
  };

  // Assign a competency to a course
  const handleAssignCompetency = async (competencyId, type) => {
    if (!selectedCourse) {
      return alert("Выберите курс для назначения!");
    }

    const endpoint =
      type === "unique"
        ? "/course-unique-competences/create"
        : "/course-shared-competences/create";

    const data =
      type === "unique"
        ? { 
            courseId: parseInt(selectedCourse, 10), // Ensure courseId is an integer
            uniqueCompetenceId: parseInt(competencyId, 10) // Ensure competencyId is an integer
          }
        : { 
            courseId: parseInt(selectedCourse, 10), // Ensure courseId is an integer
            sharedCompetenceId: parseInt(competencyId, 10) // Ensure competencyId is an integer
          };

    try {
      await axios.post(`http://localhost:8080${endpoint}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Компетенция успешно назначена!");
      fetchAssignedCompetencies(selectedCourse); // Refresh assigned competencies for the selected course
    } catch (error) {
      console.error("Ошибка при назначении:", error.response?.data || error.message);
      alert(`Ошибка: ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <div className="competency-manager">
      <h2 className="title">Управление Компетенциями</h2>

      <div className="competency-section">
        <h3 className="section-title">Добавить Компетенцию</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Введите компетенцию"
            value={newCompetency}
            onChange={(e) => setNewCompetency(e.target.value)}
            className="input-field"
          />
          <select
            value={competencyType}
            onChange={(e) => setCompetencyType(e.target.value)}
            className="dropdown"
          >
            <option value="unique">Уникальная</option>
            <option value="shared">Общая</option>
          </select>
          <button onClick={handleAddCompetency} className="btn btn-add">
            Добавить
          </button>
        </div>
      </div>

      <div className="competency-section">
        <h3 className="section-title">Уникальные Компетенции</h3>
        {uniqueCompetencies.map((comp) => (
          <div key={comp.id} className="competency-item">
            <span>{comp.name}</span>
            <div className="actions">
              <select
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="dropdown"
              >
                <option value="">Выберите курс</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssignCompetency(comp.id, "unique")}
                className="btn btn-assign"
              >
                Назначить
              </button>
              <button
                onClick={() => handleDeleteCompetency(comp.id, "unique")}
                className="btn btn-delete"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="competency-section">
        <h3 className="section-title">Общие Компетенции</h3>
        {sharedCompetencies.map((comp) => (
          <div key={comp.id} className="competency-item">
            <span>{comp.name}</span>
            <div className="actions">
              <select
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="dropdown"
              >
                <option value="">Выберите курс</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssignCompetency(comp.id, "shared")}
                className="btn btn-assign"
              >
                Назначить
              </button>
              <button
                onClick={() => handleDeleteCompetency(comp.id, "shared")}
                className="btn btn-delete"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Section: Courses with Assigned Competencies */}
      <div className="competency-section">
        <h3 className="section-title">Курсы с назначенными компетенциями</h3>
        {courses.map((course) => (
          <div key={course.id} className="course-item">
            <h4>{course.name}</h4>
            <ul>
              {assignedCompetencies[course.id]?.map((comp) => (
                <li key={comp.id}>
                  {comp.name} ({comp.type === "unique" ? "Уникальная" : "Общая"})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyManager;