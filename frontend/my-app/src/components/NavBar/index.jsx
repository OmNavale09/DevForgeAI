import "./index.css";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import Cookie from "js-cookie";

import ResumeUploadPopup from "../ResumeUploadPopup";
import NewSkillModal from "../NewSkillModal";
import NewProjectModal from "../NewProjectModal";

import { FaHome, FaPlus } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GoDot } from "react-icons/go";
import { TbLogout } from "react-icons/tb";
import { IoReorderThreeOutline } from "react-icons/io5";

const MotionNavLink = motion(NavLink);

const Navbar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toogleSkills, setToggleSkills] = useState(false);
  const [toogleProjects, setToggleProjects] = useState(false);
  const [isResumeOpen, setResumeOpen] = useState(false);
  const [isNewSkillOpen, setNewSkillOpen] = useState(false);
  const [isNewProjectOpen, setNewProjectOpen] = useState(false);
  const [skillsTitles, setSkillsTitles] = useState([]);
  const [userData, setUserData] = useState({ username: "", role: "", avatar: "" });

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    const getskills = async () => {
      const token = Cookie.get("token");
      const response = await fetch("http://localhost:5000/api/roadmaps/titles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Fixed template literal
        },
      });
      const data = await response.json();
      if (response.ok) {
        const { roadmaps } = data;
        setSkillsTitles(roadmaps);
      } else {
        alert(data.error || "failed");
      }
    };
    const getUser = async () => {
    const token = Cookie.get("token");
    const response = await fetch("http://localhost:5000/api/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Fixed template literal
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("User Data:", data);
      setUserData({
        username: data.username,
        role: data.role,
        avatar: data.avatar
      });
      console.log(data.avatar)
    } else {
      console.error("User Fetch Error:", data);
    }
  }
    getskills();
    getUser();
  }, []);

const fetchSkills = async () => {
  const token = Cookie.get("token");

  const response = await fetch("http://localhost:5000/api/roadmaps/titles", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    setSkillsTitles(data.roadmaps);
  }
};

  const dropdownItem = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const block = () => {
    const project = skillsTitles.filter((skill) => skill._id.includes("Project")) 
    const filterSkills = skillsTitles.filter((skill) => !skill._id.includes("Project")) 
    return(
    <div className="block-container">
      <div className="logo-container">
        <h1 className="logo">DevForge AI</h1>
      </div>

      <ul className="nav-items-container">
        {/* Home Link */}
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-item active-tab" : "nav-item")}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <FaHome />
          <p className="nav-para">Home</p>
        </NavLink>

        {/* Resume Link */}
        <li className="nav-item" onClick={() => setResumeOpen(true)}>
          <FiUpload />
          <p className="nav-para">Resume</p>
        </li>

        <ResumeUploadPopup isOpen={isResumeOpen} onClose={() => setResumeOpen(false)} refreshSkills={fetchSkills} />

        {/* Skills Section */}
        <li>
          <button className="nav-item2" onClick={() => setToggleSkills(!toogleSkills)}>
            <p>Skills</p>
            <IoIosArrowDown style={{ transform: toogleSkills ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          
          {toogleSkills && (
            <ul className="list-container">
              {filterSkills.map((skill, index) => (
                <NavLink
                  key={skill._id || index}
                  to={`/roadmap/${skill._id}`}
                  className={({ isActive }) => (isActive ? "nav-item3 active-tab" : "nav-item3")}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <GoDot />
                  <p style={{ marginLeft: "6px" }}>{skill.title}</p>
                </NavLink>
              ))}
              <li className="nav-item3 add-skill" style={{ border: '1px dashed #9f7aea', marginTop: '5px' }} onClick={() => setNewSkillOpen(true)}>
                <FaPlus />
                <p style={{ marginLeft: "6px" }}>New Skill</p>
              </li>
            </ul>
          )}
        </li>

        {/* Projects Section */}
        <li>
          <button className="nav-item2" onClick={() => setToggleProjects(!toogleProjects)}>
            <p>Projects</p>
            <IoIosArrowDown style={{ transform: toogleProjects ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {toogleProjects && (
            <ul className="list-container">
              {project.map((skill, index) => (
                <NavLink
                  key={skill._id || index}
                  to={`/roadmap/${skill._id}`}
                  className={({ isActive }) => (isActive ? "nav-item3 active-tab" : "nav-item3")}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <GoDot />
                  <p style={{ marginLeft: "6px" }}>{skill.title}</p>
                </NavLink>
              ))}
              <li className="nav-item3 add-skill" style={{ border: '1px dashed #9f7aea', marginTop: '5px' }} onClick={() => setNewProjectOpen(true)}>
                <FaPlus />
                <p style={{ marginLeft: "6px" }}>New Project</p>
              </li>
            </ul>
          )}
        </li>
        <li
          className='nav-item'
          onClick={() => {
            Cookie.remove("token");
            window.location.href = "/login";
          }}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <TbLogout />
          <p className="nav-para">Logout</p>
        </li>
      </ul>
    </div>
    )};
  const small = () => (
  <motion.div
    className="sidebar mobile-sidebar"
    initial={{ x: "-100%" }}
    animate={{ x: 0 }}
    exit={{ x: "-100%" }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    {block()}

    <NewSkillModal
      show={isNewSkillOpen}
      closeModal={() => setNewSkillOpen(false)}
      refreshSkills={fetchSkills}
    />

    <NewProjectModal
      show={isNewProjectOpen}
      closeModal={() => setNewProjectOpen(false)}
      refreshSkills={fetchSkills}
    />

    <MotionNavLink
      to="/profile"
      className={({ isActive }) =>
        isActive ? "profile-container profile-active" : "profile-container"
      }
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="profile-avatar">
        <img
          src={userData.avatar}
          alt="profile"
          className="profile-pic"
        />
      </div>

      <div className="profile-text">
        <h2 className="profile-name">{userData.username}</h2>
        <p className="profile-role">{userData.role}</p>
      </div>
    </MotionNavLink>
  </motion.div>
);

  return (
  <>
    {/* HAMBURGER - MOBILE ONLY */}
    <div
      className="hamburger"
      onClick={() => setSidebarOpen(prev => !prev)}
    >
      <IoReorderThreeOutline />
    </div>

    {/* MOBILE SIDEBAR */}
    {isSidebarOpen && (
      <>
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="sidebar mobile-sidebar">
          {block()}

          {/* Modals */}
          <NewSkillModal
            show={isNewSkillOpen}
            closeModal={() => setNewSkillOpen(false)}
            refreshSkills={fetchSkills}
          />

          <NewProjectModal
            show={isNewProjectOpen}
            closeModal={() => setNewProjectOpen(false)}
            refreshSkills={fetchSkills}
          />

          {/* PROFILE SECTION */}
          <MotionNavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "profile-container profile-active"
                : "profile-container"
            }
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="profile-avatar">
              <img
                src={userData.avatar}
                alt="profile"
                className="profile-pic"
              />
            </div>

            <div className="profile-text">
              <h2 className="profile-name">{userData.username}</h2>
              <p className="profile-role">{userData.role}</p>
            </div>
          </MotionNavLink>
        </div>
      </>
    )}

    {/* DESKTOP SIDEBAR */}
    <div className="sidebar desktop-sidebar">
      {block()}

      {/* Modals */}
      <NewSkillModal
        show={isNewSkillOpen}
        closeModal={() => setNewSkillOpen(false)}
        refreshSkills={fetchSkills}
      />

      <NewProjectModal
        show={isNewProjectOpen}
        closeModal={() => setNewProjectOpen(false)}
        refreshSkills={fetchSkills}
      />

      {/* PROFILE SECTION */}
      <MotionNavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "profile-container profile-active"
            : "profile-container"
        }
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="profile-avatar">
          <img
            src={userData.avatar}
            alt="profile"
            className="profile-pic"
          />
        </div>

        <div className="profile-text">
          <h2 className="profile-name">{userData.username}</h2>
          <p className="profile-role">{userData.role}</p>
        </div>
      </MotionNavLink>
    </div>
  </>
);

};

export default Navbar;