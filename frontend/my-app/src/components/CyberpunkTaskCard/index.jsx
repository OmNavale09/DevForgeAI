import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import "./index.css";

const CyberpunkTaskCard = ({ task, completed, onToggle, index }) => {
  return (
    <motion.div
      className={`task-card ${completed ? "completed" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Left Status Dot */}
      <div className={`status-dot ${completed ? "done" : "pending"}`} />

      {/* Task Content */}
      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        <p className="task-desc">{task.desc}</p>
      </div>

      {/* Toggle Button */}
      <motion.button
        className={`task-toggle ${completed ? "active" : ""}`}
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
      >
        {completed && <FaCheck />}
      </motion.button>
    </motion.div>
  );
};

export default CyberpunkTaskCard;
