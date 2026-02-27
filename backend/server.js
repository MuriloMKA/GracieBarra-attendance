const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Running with mock data...");
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock Database (Replace with MongoDB/PostgreSQL in production)
let users = [
  {
    id: 1,
    name: "João Silva",
    email: "aluno@gb.com",
    password: "123456", // In production, use bcrypt
    type: "student",
    belt: "AZUL",
    degrees: 2,
    birthDate: "1995-05-15",
    lastGraduation: "2025-06-10",
    nextGraduation: "2026-06-10",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@gb.com",
    password: "123456",
    type: "admin",
    belt: "PRETA",
    degrees: 1,
    birthDate: "1985-01-01",
    lastGraduation: "2020-01-01",
    nextGraduation: "2027-01-01",
  },
];

let checkins = [
  {
    id: 1,
    userId: 1,
    classId: 5,
    className: "GB2 Avançado",
    time: "19:00",
    date: new Date().toISOString(),
    status: "pending",
  },
];

// Routes

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Gracie Barra Attendance API is running!" });
});

// Authentication
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    token: "mock-jwt-token", // In production, use JWT
  });
});

// Get current user
app.get("/api/auth/me", (req, res) => {
  // In production, verify JWT token
  const userId = 1; // Mock
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Students - Get all
app.get("/api/students", (req, res) => {
  const students = users
    .filter((u) => u.type === "student")
    .map(({ password, ...rest }) => rest);
  res.json(students);
});

// Students - Get by ID
app.get("/api/students/:id", (req, res) => {
  const student = users.find(
    (u) => u.id === parseInt(req.params.id) && u.type === "student",
  );

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { password: _, ...studentWithoutPassword } = student;
  res.json(studentWithoutPassword);
});

// Students - Update
app.put("/api/students/:id", (req, res) => {
  const { name, email, belt, degrees, lastGraduation, nextGraduation } =
    req.body;
  const studentIndex = users.findIndex((u) => u.id === parseInt(req.params.id));

  if (studentIndex === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  users[studentIndex] = {
    ...users[studentIndex],
    name: name || users[studentIndex].name,
    email: email || users[studentIndex].email,
    belt: belt || users[studentIndex].belt,
    degrees: degrees !== undefined ? degrees : users[studentIndex].degrees,
    lastGraduation: lastGraduation || users[studentIndex].lastGraduation,
    nextGraduation: nextGraduation || users[studentIndex].nextGraduation,
  };

  const { password: _, ...updatedStudent } = users[studentIndex];
  res.json(updatedStudent);
});

// Check-ins - Create
app.post("/api/checkins", (req, res) => {
  const { userId, classId, className, time } = req.body;

  const newCheckin = {
    id: checkins.length + 1,
    userId,
    classId,
    className,
    time,
    date: new Date().toISOString(),
    status: "pending",
  };

  checkins.push(newCheckin);
  res.status(201).json(newCheckin);
});

// Check-ins - Get all pending
app.get("/api/checkins/pending", (req, res) => {
  const pendingCheckins = checkins
    .filter((c) => c.status === "pending")
    .map((checkin) => {
      const user = users.find((u) => u.id === checkin.userId);
      return {
        ...checkin,
        studentName: user?.name || "Unknown",
        studentBelt: user?.belt || "BRANCA",
      };
    });

  res.json(pendingCheckins);
});

// Check-ins - Get by user
app.get("/api/checkins/user/:userId", (req, res) => {
  const userCheckins = checkins.filter(
    (c) => c.userId === parseInt(req.params.userId),
  );
  res.json(userCheckins);
});

// Check-ins - Update status
app.put("/api/checkins/:id", (req, res) => {
  const { status } = req.body;
  const checkinIndex = checkins.findIndex(
    (c) => c.id === parseInt(req.params.id),
  );

  if (checkinIndex === -1) {
    return res.status(404).json({ error: "Check-in not found" });
  }

  checkins[checkinIndex].status = status;
  res.json(checkins[checkinIndex]);
});

// Attendance stats
app.get("/api/stats", (req, res) => {
  const today = new Date().toDateString();
  const todayCheckins = checkins.filter(
    (c) => new Date(c.date).toDateString() === today,
  );

  res.json({
    totalStudents: users.filter((u) => u.type === "student").length,
    todayCheckins: todayCheckins.filter((c) => c.status === "confirmed").length,
    pendingCheckins: checkins.filter((c) => c.status === "pending").length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
