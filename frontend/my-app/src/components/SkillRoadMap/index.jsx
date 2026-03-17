import "./index.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookie from "js-cookie";

import NavBar from "../NavBar";
import CyberpunkTaskCard from "../CyberpunkTaskCard";

const dummyData = [
  {
    phaseNumber: 1,
    title: "Python Fundamentals (The Beginner Phase)",
    point1:
      "Syntax Basics: Variables, loops (for, while), and conditional logic (if/else).",
    point2:
      "Data Collections: Master Lists, Dictionaries, and Tuples.",
    point3:
      "Functions: Learn how to write reusable code blocks.",
    point4:
      "Clean Code (PEP 8): Follow industry-standard formatting.",
  },
];

const SkillRoadMap = () => {
  const { id } = useParams();

  const [activePhase, setActivePhase] = useState(1);
  const [roadmapData, setRoadmapData] = useState([]);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const token = Cookie.get("token");

      try {
        const response = await fetch(
          `http://localhost:5000/api/roadmaps/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch roadmap");
        }

        if (!data.phases || data.phases.length === 0) {
          throw new Error("No roadmap data found");
        }

        setRoadmapData(data.phases);

        // Build completion dynamically
        const dynamicCompleted = {};
        data.phases.forEach((phase) => {
          const taskKeys = Object.keys(phase).filter((key) =>
            key.startsWith("point")
          );
          dynamicCompleted[phase.phaseNumber] = taskKeys.map(() => false);
        });

        setCompleted(dynamicCompleted);
      } catch (err) {
        console.error(err);
        setError(err.message);

        // fallback to dummy data if API fails
        setRoadmapData(dummyData);

        const fallbackCompleted = {};
        dummyData.forEach((phase) => {
          const taskKeys = Object.keys(phase).filter((key) =>
            key.startsWith("point")
          );
          fallbackCompleted[phase.phaseNumber] = taskKeys.map(() => false);
        });

        setCompleted(fallbackCompleted);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoadmap();
    } else {
      setLoading(false);
    }
  }, [id]);

  const data = roadmapData[activePhase - 1];

  const toggleTask = (index) => {
    setCompleted((prev) => ({
      ...prev,
      [activePhase]: prev[activePhase].map((val, i) =>
        i === index ? !val : val
      ),
    }));
  };

  const stages = () => (
    <div className="phase-wrapper">
      <div className="phase-line">
        <div
          className="phase-progress"
          style={{
            width:
              roadmapData.length > 1
                ? `${((activePhase - 1) / (roadmapData.length - 1)) * 100}%`
                : "0%",
          }}
        />
      </div>

      <div className="phase-container">
        {roadmapData.map((phase) => (
          <button
            key={phase.phaseNumber}
            className={`phase-circle ${
              activePhase === phase.phaseNumber ? "active-phase" : ""
            }`}
            onClick={() => setActivePhase(phase.phaseNumber)}
          >
            <span>Phase</span>
            <strong>{phase.phaseNumber}</strong>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <NavBar />

      <div className="content">
        {/* ✅ LOADING INSIDE CONTENT */}
        {loading && <div className="loading">Loading roadmap...</div>}

        {/* ✅ ERROR MESSAGE */}
        {!loading && error && (
          <div className="error">Error: {error}</div>
        )}

        {/* ✅ MAIN CONTENT */}
        {!loading && !error && data && (
          <>
            {stages()}

            <div className="phase-info">
              <h2>{data.title}</h2>

              {Object.keys(data)
                .filter((key) => key.startsWith("point"))
                .map((key, i) => (
                  <CyberpunkTaskCard
                    key={i}
                    task={{
                      title: `Task ${i + 1}`,
                      desc: data[key],
                    }}
                    completed={completed[activePhase]?.[i] || false}
                    onToggle={() => toggleTask(i)}
                    index={i}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkillRoadMap;
