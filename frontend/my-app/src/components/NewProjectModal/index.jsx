import "./index.css";
import { useState } from "react";
import Cookie from "js-cookie";

const NewProjectModal = ({ show, closeModal, refreshSkills }) => {

  const [skillName, setSkillName] = useState("");
  const [roadmapTitle, setRoadmapTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!show) return null;

  const handleSkillChange = (e) => {
    setSkillName(e.target.value);
  };

  const handleRoadmapChange = (e) => {
    setRoadmapTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const generateProjectRoadmap = async (e) => {
  e.preventDefault();

  if (!skillName) {
    alert("Project name is required");
    return;
  }

  try {
    const prompt = `
You are a Senior Software Architect designing a production-ready SaaS application.

Generate a DETAILED technical roadmap for this project:

Project Name: ${skillName}
Project Description: ${description}
Technology Stack: ${roadmapTitle}

Rules:

1. No generic points like "define requirements".
2. Each phase must contain implementation-level steps.
3. Include:
   - Database schema design
   - API structure
   - Authentication flow
   - Folder structure planning
   - AI integration (if relevant)
   - Deployment strategy
4. Stop at Deployment (no maintenance phase).
5. Increase phases if needed.
6. Points must guide actual coding.

Return STRICT JSON only:

{
  "title": "",
  "description": "",
  "totalPhases": 0,
  "phases": [
    {
      "phaseNumber": 1,
      "title": "",
      "point1": "",
      "point2": "",
      "point3": "",
      "point4": ""
    }
  ]
}


Rules:
- No explanation
- No markdown
- Valid JSON only
`;

    const res = await window.puter.ai.chat(prompt, {
      model: "gpt-4o",
    });

    const raw = res?.message?.content || res;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // 🔥 Send to backend
    const response = await fetch(
      "http://localhost:5000/api/project_roadmap",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookie.get("token")}`,
        },
        body: JSON.stringify(parsed),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save Project Roadmap");
    }

    refreshSkills();
    closeModal();

  } catch (err) {
    console.error("Roadmap Generation Error:", err);
    alert("Failed to generate roadmap");
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add New Project</h2>

        <form className="modal-form" onSubmit={generateProjectRoadmap}>
          <input
            type="text"
            placeholder="Project Name"
            className="modal-input"
            value={skillName}
            onChange={handleSkillChange}
          />

          <input
            type="text"
            placeholder="Technology Stack (e.g., React, Node.js)"
            className="modal-input"
            value={roadmapTitle}
            onChange={handleRoadmapChange}
          />

          <textarea
            placeholder="Description"
            className="modal-textarea"
            value={description}
            onChange={handleDescriptionChange}
          />

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
