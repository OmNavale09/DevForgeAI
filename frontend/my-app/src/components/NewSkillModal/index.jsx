import "./index.css";
import { useState } from "react";
import Cookie from "js-cookie";

const NewSkillModal = ({ show, closeModal, refreshSkills }) => {

  const [skillName, setSkillName] = useState("");
  const [roadmapTitle, setRoadmapTitle] = useState("");
  const [message, setMessage] = useState("");

  if (!show) return null;

  const handleSkillChange = (e) => {
    setSkillName(e.target.value);
  };

  const handleRoadmapChange = (e) => {
    setRoadmapTitle(e.target.value);
  };

  const generateRoadmap = async (event) => {
    event.preventDefault();
      try {
        setMessage("Generating personalized roadmap...");
  
        const prompt = `
  You are an expert career mentor.
  
  Create a DETAILED beginner-friendly roadmap to learn ${skillName}
  from beginner to advanced level.
  
  RULES:
  - Minimum 5 phases (more if needed).
  - Each phase must contain:
    phaseNumber
    title
    point1
    point2
    point3
    point4
  - Each point must be detailed and practical.
  - No vague lines like "learn basics".
  - Return STRICT JSON only.
  - Do not add explanations.
  - Do not add markdown.
  
  JSON format:
  
  {
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
  
        // 🔥 Save to backend (ONLY storing, not generating)
        await fetch("http://localhost:5000/api/roadmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
         body: JSON.stringify({
    title: `Roadmap to Learn ${skillName}`,
    description: "AI Generated Career Roadmap",
    totalPhases: parsed.phases.length,
    phases: parsed.phases,
  }),
        });
  
        setMessage("Roadmap generated and saved successfully!");
        refreshSkills();
        closeModal()

  
      } catch (error) {
        console.error("Roadmap Generation Error:", error);
        setMessage("Something went wrong while generating roadmap.");
      }
};
  

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add New Skill</h2>

        <form className="modal-form" onSubmit={generateRoadmap}>
          <input
            type="text"
            placeholder="Skill Name"
            className="modal-input"
            value={skillName}
            onChange={handleSkillChange}
          />

          <input
            type="text"
            placeholder="Roadmap Title"
            className="modal-input"
            value={roadmapTitle}
            onChange={handleRoadmapChange}
          />

          <p>{message}</p>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Save Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSkillModal;
