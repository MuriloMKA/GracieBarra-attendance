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
    closedDates: [String],
  },
  { timestamps: true },
);

// Models
const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);

// Helper Functions para cálculo de graus
const getWeeksRequiredForNextDegree = (belt, currentDegree, program) => {
  // GBK (Crianças/Adolescentes) - TODOS os graus levam 1 mês (4 semanas)
  if (program === "GBK") {
    const maxDegrees = belt === "White" || belt === "GreyWhite" ? 5 : 11;
    if (currentDegree >= maxDegrees) return null;
    return 4; // 1 mês = 4 semanas
  }

  // ADULTOS
  if (belt !== "Black" && currentDegree >= 4) return null;
  if (belt === "Black" && currentDegree >= 6) return null;

  const nextDegree = currentDegree + 1;

  // Faixa Branca
  if (belt === "White") {
    if (nextDegree === 1) return 4;
    if (nextDegree === 2) return 4;
    if (nextDegree === 3) return 8;
    if (nextDegree === 4) return 16;
  }

  // Faixa Azul
  if (belt === "Blue") {
    if (nextDegree === 1) return 16;
    if (nextDegree === 2) return 20;
    if (nextDegree === 3) return 20;
    if (nextDegree === 4) return 20;
  }

  // Faixa Roxa
  if (belt === "Purple") {
    if (nextDegree === 1) return 12;
    if (nextDegree === 2) return 12;
    if (nextDegree === 3) return 16;
    if (nextDegree === 4) return 16;
  }

  // Faixa Marrom
  if (belt === "Brown") {
    if (nextDegree === 1) return 12;
    if (nextDegree === 2) return 12;
    if (nextDegree === 3) return 16;
    if (nextDegree === 4) return 16;
  }

  // Faixa Preta
  if (belt === "Black") {
    if (nextDegree === 1) return 156;
    if (nextDegree === 2) return 156;
    if (nextDegree === 3) return 156;
    if (nextDegree === 4) return 260;
    if (nextDegree === 5) return 260;
    if (nextDegree === 6) return 260;
  }

  return null;
};

const calculateCompletedWeeks = (attendanceRecords, lastGraduationDate) => {
  const graduationDate = new Date(lastGraduationDate);

  // Filtra apenas presenças confirmadas após a última graduação
  const validAttendances = attendanceRecords.filter(
    (a) => a.confirmed && new Date(a.date) >= graduationDate,
  );

  // Agrupa treinos por semana
  const weekMap = new Map();

  validAttendances.forEach((attendance) => {
    const attendanceDate = new Date(attendance.date);
    const weekStart = new Date(attendanceDate);
    weekStart.setDate(attendanceDate.getDate() - attendanceDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString();

    const currentCount = weekMap.get(weekKey) || 0;
    weekMap.set(weekKey, currentCount + 1);
  });

  // Calcula semanas completas
  let totalWeeks = 0;
  weekMap.forEach((daysInWeek) => {
    if (daysInWeek === 1) {
      totalWeeks += 0.5;
    } else if (daysInWeek >= 2) {
      totalWeeks += 1;
    }
  });

  return totalWeeks;
};

const checkIfReadyForDegree = async (student, attendanceDate) => {
  const weeksRequired = getWeeksRequiredForNextDegree(
    student.belt,
    student.degrees,
    student.program,
  );

  if (!weeksRequired) return false;

  // Busca todas as presenças do aluno
  const allAttendances = await Attendance.find({
    studentId: student._id,
    confirmed: true,
  });

  const weeksCompleted = calculateCompletedWeeks(
    allAttendances,
    student.lastGraduationDate,
  );

  return weeksCompleted >= weeksRequired;
};

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

// Endpoint para listar alunos prontos para receber grau (DEVE VIR ANTES DE :id)
app.get(
  "/api/students/ready-for-degree",
  authenticateToken,
  async (req, res) => {
    try {
      const students = await Student.find();
      const studentsReadyForDegree = [];

      for (const student of students) {
        const weeksRequired = getWeeksRequiredForNextDegree(
          student.belt,
          student.degrees,
          student.program,
        );

        if (!weeksRequired) continue;

        const allAttendances = await Attendance.find({
          studentId: student._id,
          confirmed: true,
        });

        const weeksCompleted = calculateCompletedWeeks(
          allAttendances,
          student.lastGraduationDate,
        );

        if (weeksCompleted >= weeksRequired) {
          const confirmedCount = allAttendances.length;
          const studentObj = student.toJSON
            ? student.toJSON()
            : student.toObject();
          studentsReadyForDegree.push({
            ...studentObj,
            weeksCompleted: Math.floor(weeksCompleted * 10) / 10,
            weeksRequired,
            nextDegree: student.degrees + 1,
            confirmedAttendances: confirmedCount,
          });
        }
      }

      res.json(studentsReadyForDegree);
    } catch (error) {
      console.error("Erro ao buscar alunos prontos para grau:", error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  },
);

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

    // Se a presença foi confirmada, verificar se é uma data de grau previsto
    if (req.body.confirmed === true) {
      try {
        const student = await Student.findById(attendance.studentId);
        if (student) {
          // Verifica se o aluno está pronto para receber o próximo grau
          const isReadyForDegree = await checkIfReadyForDegree(
            student,
            attendance.date.toISOString().split("T")[0],
          );

          if (isReadyForDegree) {
            // Auto-incrementa o grau
            student.degrees += 1;
            student.lastGraduationDate = attendance.date
              .toISOString()
              .split("T")[0];

            // Adiciona aos special dates
            student.specialDates.push({
              date: attendance.date.toISOString().split("T")[0],
              type: "grade",
              notes: `${student.degrees}° Grau - Confirmado automaticamente`,
            });

            await student.save();

            console.log(
              `✅ Grau auto-incrementado: ${student.name} - ${student.degrees}° grau`,
            );
          }
        }
      } catch (degreeError) {
        // Log o erro mas não falha a requisição de confirmação de presença
        console.error("Erro ao auto-incrementar grau:", degreeError);
      }
    }

    res.json(attendance);
  } catch (error) {
    console.error("Erro ao atualizar presença:", error);
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

app.put("/api/classes/:id", authenticateToken, async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!classItem) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    res.json(classItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/classes/:id", authenticateToken, async (req, res) => {
  try {
    const classItem = await Class.findByIdAndDelete(req.params.id);

    if (!classItem) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    res.json({ message: "Aula excluída com sucesso", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      {
        name: "Lucas Mendes",
        email: "lucas@example.com",
        program: "GBK",
        belt: "Yellow",
        degrees: 1,
        lastGraduationDate: "2026-01-15",
        nextDegreeDate: "2026-03-15",
        birthDate: "2016-05-10",
        specialDates: [
          {
            type: "graduation",
            date: "2026-01-15",
            notes: "Faixa Amarela",
          },
        ],
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
      {
        email: "lucas@example.com",
        password: await bcrypt.hash("aluno123", 10),
        role: "student",
        name: "Lucas Mendes",
        studentId: createdStudents[4]._id.toString(),
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

    // Criar presenças de exemplo para Lucas Mendes (para visualização)
    const lucasId = createdStudents[4]._id.toString();
    const lucasAttendances = [
      // Semana 1 (Jan 22-26)
      {
        studentId: lucasId,
        date: "2026-01-22",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-01-24",
        confirmed: true,
        classId: null,
      },
      // Semana 2 (Jan 27-31)
      {
        studentId: lucasId,
        date: "2026-01-27",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-01-29",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-01-31",
        confirmed: true,
        classId: null,
      },
      // Semana 3 (Fev 3-7)
      {
        studentId: lucasId,
        date: "2026-02-03",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-02-05",
        confirmed: true,
        classId: null,
      },
      // Semana 4 (Fev 10-14)
      {
        studentId: lucasId,
        date: "2026-02-10",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-02-12",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-02-14",
        confirmed: true,
        classId: null,
      },
      // Semana 5 (Fev 17-21)
      {
        studentId: lucasId,
        date: "2026-02-17",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-02-19",
        confirmed: true,
        classId: null,
      },
      // Semana 6 (Fev 24-28)
      {
        studentId: lucasId,
        date: "2026-02-24",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-02-26",
        confirmed: true,
        classId: null,
      },
      // Semana 7 (Mar 3-7)
      {
        studentId: lucasId,
        date: "2026-03-03",
        confirmed: true,
        classId: null,
      },
      {
        studentId: lucasId,
        date: "2026-03-05",
        confirmed: true,
        classId: null,
      },
      // Semana 8 (Mar 9-10)
      {
        studentId: lucasId,
        date: "2026-03-09",
        confirmed: true,
        classId: null,
      },
    ];

    await Attendance.insertMany(lucasAttendances);

    res.json({
      message: "Dados iniciais criados com sucesso!",
      users: {
        admin: "admin@graciebarra.com / admin123",
        students:
          "joao@example.com, maria@example.com, carlos@example.com, pedro@example.com, lucas@example.com / aluno123",
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
