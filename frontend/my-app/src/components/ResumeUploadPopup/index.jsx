import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Cookie from "js-cookie";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import "./index.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

Modal.setAppElement("#root");

const ResumeUploadPopup = ({ isOpen, onClose, refreshSkills, getResumeText }) => {
  const [resumeText, setResumeText] = useState("");
  const [puterReady, setPuterReady] = useState(false);
  const [missingSkill, setMissingSkill] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (!missingSkill || !puterReady) return;

  const generateRoadmap = async () => {
    try {
      setMessage("Generating personalized roadmap...");

      const prompt = `
You are an expert career mentor.

Create a DETAILED beginner-friendly roadmap to learn ${missingSkill}
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
  title: `Roadmap to Learn ${missingSkill}`,
  description: "AI Generated Career Roadmap",
  totalPhases: parsed.phases.length,
  phases: parsed.phases,
}),
      });

      setMessage("Roadmap generated and saved successfully!");
      refreshSkills();

    } catch (error) {
      console.error("Roadmap Generation Error:", error);
      setMessage("Something went wrong while generating roadmap.");
    }
  };

  generateRoadmap();
}, [missingSkill, puterReady]);


  /* ===============================
     LOAD PUTER SCRIPT
  ==============================*/
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;

    script.onload = () => {
      console.log("✅ Puter Loaded");
      setPuterReady(true);
    };

    document.body.appendChild(script);
  }, []);

  /* ===============================
     CALL INDUSTRY AI ANALYSIS
  ==============================*/
  useEffect(() => {
    if (!resumeText || !puterReady) return;

    const finalPrompt = `
Act as a Senior Technical Architect and Career Consultant.

Your Task:

Analyze Existing Skills
Identify Growth Areas (AI/ML)
Identify Growth Areas (Modern Web)

Constraint:
DO NOT include testing skills.

Output Requirement:
Return ONLY the ONE most critical missing skill as a single string.

Resume Text:
${resumeText}
`;

    window.puter.ai
      .chat(finalPrompt, { model: "gpt-4o" })
      .then((response) => {
        console.log("🤖 Industry Analysis Result:", response?.message?.content);

        const result =
          response?.message?.content || response;
        setMessage(`Critical Missing Skill Identified: ${result}`);
        generateProjectRoadmap(result);
        setMissingSkill(result);
      })
      .catch((err) => {
        console.error("❌ AI Analysis Error:", err);
      });
  }, [resumeText, puterReady]);

    /* ===============================
      FETCH USER SKILLS (TO REFRESH AFTER ROADMAP)
    ==============================*/

const analyzeProfileData = async (text) => {
  try {
    const prompt = `
You are a resume parser.

Extract ONLY the following:

1. skills grouped EXACTLY into:
frontend, backend, database, other

2. projects list:
name + description

Return STRICT JSON ONLY in this format:

{
  "skills": {
    "frontend": [],
    "backend": [],
    "database": [],
    "other": []
  },
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ]
}

Rules:
- No explanation
- No markdown
- No extra text
- Valid JSON only

Resume:
${text}
`;

    const res = await window.puter.ai.chat(prompt, {
      model: "gpt-4o",
    });

    const rawResult = res?.message?.content || res;

    console.log("🤖 AI RAW RESPONSE:", rawResult);

    // 🔥 clean JSON (AI sometimes wraps ```json```)
    const cleaned = rawResult
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleaned);

    // 🔥 ensure schema-safe structure
    const finalPayload = {
      skills: {
        frontend: parsedData.skills?.frontend || [],
        backend: parsedData.skills?.backend || [],
        database: parsedData.skills?.database || [],
        other: parsedData.skills?.other || [],
      },
      projects: parsedData.projects || [],
    };

    console.log("📦 Sending Profile AI Data:", finalPayload);

    const response = await fetch(
      "http://localhost:5000/api/profile/ai-update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookie.get("token")}`,
        },
        body: JSON.stringify(finalPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend Error:", data);
      return;
    }

    console.log("✅ Profile Updated Successfully:", data);

  } catch (err) {
    console.error("❌ AI Profile Analysis Error:", err);
  }
};

const generateProjectRoadmap = async (missingSkill) => {
  const prompt = `
You are a Senior Industry Architect.

Generate a COMPLETE industry-ready project roadmap
to master this skill: ${missingSkill}

Return STRICT JSON only in this format:

{
  "title": "Project for ${missingSkill}",
  "description": "",
  "totalPhases": 4,
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

  // Send to backend
  await fetch("http://localhost:5000/api/project_roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookie.get("token")}`,
    },
    body: JSON.stringify(parsed),
  });
};


  /* ===============================
     PDF TEXT EXTRACTION
  ==============================*/
  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          fullText += strings.join(" ") + " ";
        }

        console.log("📄 Extracted Resume Text:", fullText);
        setMessage("Resume uploaded and analyzed successfully!");
        analyzeProfileData(fullText);
        setResumeText(fullText);

      } catch (err) {
        console.error("PDF Extraction Error:", err);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  /* ===============================
     FILE HANDLER
  ==============================*/
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type === "application/pdf") {
      setMessage("Processing resume...");
      extractTextFromPDF(file);
    } else {
      alert("Please upload a PDF file");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="resume-modal"
      overlayClassName="resume-overlay"
    >
      <h2 className="resume-title">Upload Resume</h2>

      <input
        className="resume-input"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <p>{message}</p>
      <button className="resume-close-btn" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
};

export default ResumeUploadPopup;
