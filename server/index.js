import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_development";

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user;
    next();
  });
};

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
    studentId: String, // Mudado de ObjectId para String
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

// Students Routes (protegidas)
app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/students/:id", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", authenticateToken, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/students/:id", authenticateToken, async (req, res) => {
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

// Attendance Routes (protegidas)
app.get("/api/attendance", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const attendance = await Attendance.find(query).populate("studentId");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/attendance", authenticateToken, async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/attendance/:id", authenticateToken, async (req, res) => {
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

// Classes Routes (protegidas)
app.get("/api/classes", authenticateToken, async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/classes", authenticateToken, async (req, res) => {
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Comparar senha com hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        studentId: user.studentId, // Agora é string no schema
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { password, ...userData } = req.body;

    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para limpar e reinicializar o banco
app.post("/api/setup/reset", async (req, res) => {
  try {
    // Limpar todas as coleções
    await User.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Class.deleteMany({});

    res.json({
      message:
        "Banco de dados limpo com sucesso! Use /api/setup/init para criar dados iniciais.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para criar dados iniciais (usar apenas uma vez)
app.post("/api/setup/init", async (req, res) => {
  try {
    // Criar alunos de teste
    const students = [
      {
        name: "João Silva",
        email: "joao@example.com",
        program: "GB1",
        belt: "White",
        degrees: 1,
        lastGraduationDate: "2025-08-20",
        nextDegreeDate: "2026-05-20",
        birthDate: "1995-03-15",
        specialDates: [],
      },
      {
        name: "Maria Santos",
        email: "maria@example.com",
        program: "GB1",
        belt: "Blue",
        degrees: 2,
        lastGraduationDate: "2024-06-10",
        nextDegreeDate: "2026-06-10",
        birthDate: "1998-07-22",
        specialDates: [],
      },
      {
        name: "Carlos Oliveira",
        email: "carlos@example.com",
        program: "GB2",
        belt: "Purple",
        degrees: 0,
        lastGraduationDate: "2025-01-15",
        nextDegreeDate: "2027-01-15",
        birthDate: "1992-11-30",
        specialDates: [],
      },
      {
        name: "Pedro Costa",
        email: "pedro@example.com",
        program: "GBK",
        belt: "Grey",
        degrees: 3,
        lastGraduationDate: "2025-09-05",
        nextDegreeDate: "2026-03-05",
        birthDate: "2015-02-18",
        specialDates: [],
      },
    ];

    const createdStudents = await Student.insertMany(students);

    // Criar usuários
    const users = [
      {
        email: "admin@graciebarra.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        name: "Professor Admin",
      },
      {
        email: "joao@example.com",
        password: await bcrypt.hash("aluno123", 10),
        role: "student",
        name: "João Silva",
        studentId: createdStudents[0]._id.toString(),
      },
      {
        email: "maria@example.com",
        password: await bcrypt.hash("aluno123", 10),
        role: "student",
        name: "Maria Santos",
        studentId: createdStudents[1]._id.toString(),
      },
      {
        email: "carlos@example.com",
        password: await bcrypt.hash("aluno123", 10),
        role: "student",
        name: "Carlos Oliveira",
        studentId: createdStudents[2]._id.toString(),
      },
      {
        email: "pedro@example.com",
        password: await bcrypt.hash("aluno123", 10),
        role: "student",
        name: "Pedro Costa",
        studentId: createdStudents[3]._id.toString(),
      },
    ];

    await User.insertMany(users);

    // Criar aulas padrão
    const classes = [
      {
        name: "Fundamentos",
        time: "19:00",
        instructor: "Professor Admin",
        daysOfWeek: [1, 3, 5], // Segunda, Quarta, Sexta
      },
      {
        name: "Avançado",
        time: "20:30",
        instructor: "Professor Admin",
        daysOfWeek: [1, 3, 5],
      },
      {
        name: "Kids",
        time: "17:00",
        instructor: "Professor Admin",
        daysOfWeek: [2, 4], // Terça, Quinta
      },
    ];

    await Class.insertMany(classes);

    res.json({
      message: "Dados iniciais criados com sucesso!",
      users: {
        admin: "admin@graciebarra.com / admin123",
        students:
          "joao@example.com, maria@example.com, carlos@example.com, pedro@example.com / aluno123",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse pelo celular em http://SEU_IP_LOCAL:${PORT}`);
  });
});
