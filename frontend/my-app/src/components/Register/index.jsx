import "./index.css";
import { useState } from "react";
import { motion } from "framer-motion";
import NeuralBackground from "./NeuralBackground";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration Successful ⚡");
      navigate("/");
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div className="login-container">

      <NeuralBackground />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.9, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="login-title">DevForge AI</h1>
        <p className="login-sub">Create Neural Identity</p>

        <form onSubmit={handleSubmit} className="login-form">

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Neural ID (Email)"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Security Key"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Create Account ⚡
          </motion.button>

        </form>
      </motion.div>

    </div>
  );
};

export default Register;
