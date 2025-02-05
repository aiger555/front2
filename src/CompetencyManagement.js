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

  useEffect(() => {
    fetchCompetencies();
    fetchCourses();
  }, []);

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

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error.message);
    }
  };

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
        ? { courseId: selectedCourse, uniqueCompetenceId: competencyId }
        : { courseId: selectedCourse, sharedCompetenceId: competencyId };
  
    try {
      await axios.post(`http://localhost:8080${endpoint}`, data, {
        headers: { "Content-Type": "application/json" },
      });
  
      alert("Компетенция успешно назначена!");
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
    </div>
  );
};

export default CompetencyManager;
