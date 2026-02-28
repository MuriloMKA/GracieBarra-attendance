import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
};

// Schemas
const studentSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    program: { type: String, enum: ["GBK", "GB1", "GB2", "GB3"] },
    belt: {
      type: String,
      enum: [
        "White",
        "Grey",
        "Yellow",
        "Orange",
        "Green",
        "Blue",
        "Purple",
        "Brown",
        "Black",
      ],
    },
    degrees: { type: Number, default: 0 },
    lastGraduationDate: String,
    nextDegreeDate: String,
    birthDate: String,
    specialDates: [
      {
        date: String,
        type: { type: String, enum: ["graduation", "grade"] },
        notes: String,
      },
    ],
  },
  { timestamps: true },
);

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    date: Date,
    classId: String,
    className: String,
    classTime: String,
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    name: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  },
  { timestamps: true },
);

const classSchema = new mongoose.Schema(
  {
    name: String,
    time: String,
    instructor: String,
    daysOfWeek: [Number],
  },
  { timestamps: true },
);

// Models
const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Students Routes
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Attendance Routes
app.get("/api/attendance", async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const attendance = await Attendance.find(query).populate("studentId");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/attendance/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!attendance)
      return res.status(404).json({ error: "Attendance not found" });
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Classes Routes
app.get("/api/classes", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/classes", async (req, res) => {
  try {
    const classItem = new Class(req.body);
    await classItem.save();
    res.status(201).json(classItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User/Auth Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("studentId");

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.studentId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse pelo celular em http://SEU_IP_LOCAL:${PORT}`);
  });
});
