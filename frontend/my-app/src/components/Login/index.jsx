import "./index.css";
import { useState } from "react";
import { motion } from "framer-motion";
import NeuralBackground from "./NeuralBackground";

import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      Cookies.set("token", data.token, { expires: 7 });
      navigate("/");
    } else {
      alert(data.error || "Login failed");
    }
  }

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
        <p className="login-sub">Neural Access Portal</p>

        <form onSubmit={handleSubmit} className="login-form">

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
            Initialize Session ⚡
          </motion.button>

        </form>
      </motion.div>

    </div>
  );
};

export default Login;
