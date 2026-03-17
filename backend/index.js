require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuid } = require("uuid");


const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE CONNECTION
================================*/
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

/* ===============================
   USERS COLLECTION (AUTH ONLY)
================================*/
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

/* ===============================
   PROFILES COLLECTION
================================*/
const ProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  username: String,
  name: String,
  role: String,
  bio: String,
  location: String,

  contact: {
    phone: String,
    email: String,
    linkedin: String,
  },

  skills: {
    frontend: [String],
    backend: [String],
    database: [String],
    other: [String],
  },

  projects: [
    {
      name: String,
      description: String,
    },
  ],

  avatarUrl: String,

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Profile = mongoose.model("Profile", ProfileSchema);

/* ===============================
   ROADMAP COLLECTION
================================*/
const RoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    _id: String,
    title: String,
    description: String,
    totalPhases: Number,

    phases: [
      {
        phaseNumber: Number,
        title: String,
        point1: String,
        point2: String,
        point3: String,
        point4: String,
      },
    ],
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", RoadmapSchema);

/* ===============================
   AUTH MIDDLEWARE
================================*/
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};


/* ===============================
   REGISTER API
================================*/
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, Email and Password required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ error: "Email already exists" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await Profile.create({
      userId: newUser._id,
      username,
      name: name || username,
      role: "Developer",
      bio: "",
      location: "",
      contact: { email },
      skills: {
        frontend: [],
        backend: [],
        database: [],
        other: [],
      },
      avatarUrl: "https://tse4.mm.bing.net/th/id/OIP.8yzjgZlu1ua1re5vqsrAqgHaEK?pid=Api&P=0&h=180",
    });

    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
      },
      process.env.JWT_SECRET,
    );

    res.json({
      message: "Registered successfully",
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ===============================
   LOGIN API
================================*/
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET
    );

    res.json({
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
/* ===============================
   ROADMAP SAVE API (NO AI HERE)
================================*/
app.post("/api/roadmap", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      phases,
      totalPhases
    } = req.body;

    if (!title || !phases || !Array.isArray(phases)) {
      return res.status(400).json({
        error: "Invalid roadmap data",
      });
    }

    const userId = req.user.userId;

    /* ===============================
       PREVENT DUPLICATE ROADMAP
    ==============================*/
    const existing = await Roadmap.findOne({
      userId,
      title,
    });

    if (existing) {
      return res.json({
        success: true,
        roadmap: existing,
        message: "Roadmap already exists",
      });
    }

    /* ===============================
       BUILD ROADMAP OBJECT
    ==============================*/
    const roadmapData = {
      _id: uuid(),
      userId,
      title,
      description: description || "AI Generated Career Roadmap",
      phases,
      totalPhases: totalPhases || phases.length,
    };

    /* ===============================
       SAVE TO DATABASE
    ==============================*/
    await Roadmap.create(roadmapData);

    res.json({
      success: true,
      roadmap: roadmapData,
    });

  } catch (err) {
    console.error("Roadmap Save Error:", err);
    res.status(500).json({
      error: "Failed to save roadmap",
    });
  }
});

/* ===============================
   GET ROADMAP TITLES (FOR NAVBAR)
================================*/
app.get("/api/roadmaps/titles", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const roadmaps = await Roadmap.find(
      { userId },
      { _id: 1, title: 1 } // return only id + title
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      roadmaps,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to fetch roadmap titles",
    });
  }
});

/* ===============================
   GET ROADMAP DETAILS
================================*/
app.get("/api/roadmaps/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await Roadmap.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    res.json({
      success: true,
      phases: roadmap.phases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ===============================
   GET USER DETAILS
================================*/
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { userId: req.user.userId },
      { username: 1, role: 1, avatarUrl: 1 } // only required fields
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      username: profile.username,
      role: profile.role,
      avatar: profile.avatarUrl,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// UPDATE PROFILE FROM AI
// ==============================
app.post("/api/profile/ai-update", authMiddleware, async (req, res) => {
  try {
    const { skills, projects } = req.body;

    // basic validation
    if (!skills || !projects) {
      return res.status(400).json({
        error: "Skills and projects are required",
      });
    }

    // build update object
    const updateData = {
      skills: {
        frontend: skills.frontend || [],
        backend: skills.backend || [],
        database: skills.database || [],
        other: skills.other || [],
      },
      projects: projects || [],
      updatedAt: new Date(),
    };

    // 🔥 update or create profile automatically
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      {
        new: true,
        upsert: true, // create profile if not exists
      }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });

  } catch (err) {
    console.error("AI Profile Update Error:", err);
    res.status(500).json({
      error: "Server error while updating profile",
    });
  }
});

// ==============================
// GET FULL PROFILE DETAILS
// ==============================
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user.userId,
    });

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    res.json({
      username: profile.username,
      name: profile.name,
      role: profile.role,
      bio: profile.bio,
      location: profile.location,

      contact: {
        phone: profile.contact?.phone || "",
        email: profile.contact?.email || "",
        linkedin: profile.contact?.linkedin || "",
      },

      skills: {
        frontend: profile.skills?.frontend || [],
        backend: profile.skills?.backend || [],
        database: profile.skills?.database || [],
        other: profile.skills?.other || [],
      },

      projects: profile.projects || [],

      avatar: profile.avatarUrl,
      updatedAt: profile.updatedAt,
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({
      error: "Server error while fetching profile",
    });
  }
});


app.put("/api/profile/update", authMiddleware, async (req, res) => {
  try {
    const {
      avatarUrl,
      name,
      role,
      bio,
      email,
      phone,
      securityKey, // password
    } = req.body;

    /* =========================
       UPDATE PROFILE COLLECTION
    ==========================*/
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          avatarUrl,
          name,
          role,
          bio,
          "contact.email": email,
          "contact.phone": phone,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    /* =========================
       UPDATE USER PASSWORD
    ==========================*/
    if (securityKey && securityKey.trim() !== "") {
      const hashedPassword = await bcrypt.hash(securityKey, 10);

      await User.findByIdAndUpdate(req.user.userId, {
        password: hashedPassword,
      });
    } 

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
  GENERATE PROJECT ROADMAP
==========================*/
app.post("/api/project_roadmap", authMiddleware, async (req, res) => {
  try {
    const { title, description, totalPhases, phases } = req.body;

    if (!title || !phases) {
      return res.status(400).json({ message: "Invalid roadmap data" });
    }

    const newRoadmap = new Roadmap({
      _id: `Project_${uuid()}`,
      userId: req.user.userId,
      title,
      description,
      totalPhases,
      phases,
    });

    await newRoadmap.save();

    res.status(200).json({
      message: "Roadmap saved successfully",
      roadmap: newRoadmap,
    });
  } catch (err) {
    console.error("Roadmap Error:", err);
    res.status(500).json({ message: "Roadmap save failed" });
  }
});

/* ===============================
   SERVER
================================*/
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on ${process.env.PORT}`)
);
