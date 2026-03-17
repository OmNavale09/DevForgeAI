import "./index.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import NavBar from "../NavBar";
import Cookie from "js-cookie";
import { BiSolidEdit } from "react-icons/bi";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [securityKey, setSecurityKey] = useState(""); 
  
  const [profileData, setProfileData] = useState({
    skills: {
      frontend: [],
      backend: [],
      database: [],
      other: [],
    },
    projects: [],
    name: "",
    role: "",
    bio: "",
    avatarUrl: "",
  });

  const changeKey = event => {
    setSecurityKey(event.target.value)
  };
  const changeName = event => {
    setProfileData({...profileData, name: event.target.value})
  }  
  const changeRole = event => {
    setProfileData({...profileData, role: event.target.value})
  }
  const changeBio = event => {
    setProfileData({...profileData, bio: event.target.value})
  }
  const changeImg = event => {
    setProfileData({...profileData, avatarUrl: event.target.value})
  }
  const changeEmail = event => {
    setProfileData({...profileData, email: event.target.value})
  }
  const changePhone = event => {
    setProfileData({...profileData, phone: event.target.value})
  }      

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = Cookie.get("token");

        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setProfileData({
            skills: data.skills || {
              frontend: [],
              backend: [],
              database: [],
              other: [],
            },
            projects: data.projects || [],
            name: data.name || "",
            role: data.role || "",
            bio: data.bio || "",
            avatarUrl: data.avatar || "",
            email: data.contact.email || "",
            phone: data.contact.phone || "",
          });
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const updateProfile = async () => {
    const token = Cookie.get("token");
    const {email, phone} = profileData;

    await fetch("http://localhost:5000/api/profile/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      avatarUrl,
      name,
      role,
      bio,
      email,
      phone,
      securityKey, // optional password
      })
    });
    setIsEditing(false)
  };


  if (loading) {
    return <h2 style={{ padding: "30px" }}>Loading profile...</h2>;
  }

  const { skills = {}, projects = [], name, role, bio, avatarUrl } = profileData;

  return (
    <div className="main-container neural-bg">
      <NavBar />

      <div className="content profile-page">
        {/* PROFILE CARD */}
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BiSolidEdit
            className="edit-icon"
            onClick={() => setIsEditing(true)}
          />

          <div className="profile-info">
            <motion.div
              className="avatar-hologram"
              animate={{
                boxShadow: [
                  "0 0 10px #9f7aea55",
                  "0 0 30px #9f7aeaaa",
                  "0 0 10px #9f7aea55",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img
                src={
                  avatarUrl ||
                  "https://wallpapers.com/images/hd/dark-grunge-anime-boy-profile-jdj12zmjs5za5byf.jpg"
                }
                alt="profile"
                className="profile-big-img"
              />
            </motion.div>

            <div>
              <h1 className="profile-name2">{name || "User Name"}</h1>
              <p className="profile-role">{role || "Developer"}</p>
              <p className="profile-desc">{bio || "No bio added yet."}</p>
            </div>
          </div>
        </motion.div>

        {/* SKILLS */}
        <motion.div className="skill-section">
          <h2>⚡ Skill Matrix</h2>

          <div className="skill-grid">
            {Object.entries(skills).map(([category, items]) => (
              <div className="skill-card" key={category}>
                <h3>{category.toUpperCase()}</h3>

                {items.length > 0 ? (
                  items.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills added</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* PROJECTS */}
        <motion.div className="project-section">
          <h2>🚀 Projects</h2>

          <div className="project-grid">
            {projects.length > 0 ? (
              projects.map((project) => (
                <motion.div
                  key={project.name}
                  className="project-card"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </motion.div>
              ))
            ) : (
              <p>No projects added</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* EDIT PANEL */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="edit-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <h2>Edit Profile</h2>
            <input placeholder="Profile Image URL" onChange={changeImg} value={profileData.avatarUrl}/>
            <input placeholder="Name" onChange={changeName} value={profileData.name}/>
            <input placeholder="Role" onChange={changeRole} value={profileData.role}/>
            <textarea placeholder="Description" onChange={changeBio} value={profileData.bio}/>

            <div className="personal-info-container">
              <h2>Personal Information</h2>
              <input placeholder="Email" onChange={changeEmail} value={profileData.email}/>
              <input placeholder="Phone Number" onChange={changePhone} value={profileData.phone}/>
              <input placeholder="Security key" onChange={changeKey} value={profileData.securityKey}/>
            </div>

            <button onClick={updateProfile}>
              Save & Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
