import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { configureMongoSrvDns } from "../mongo-srv-dns.js";

dotenv.config();

configureMongoSrvDns();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_development";
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const DEFAULT_ADMIN_EMAIL =
  (process.env.DEFAULT_ADMIN_EMAIL || "Gabriel.recreio@gmail.com")
    .trim()
    .toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "961433";

// Configuração do nodemailer (use variáveis de ambiente EMAIL_USER e EMAIL_PASS no .env ou railway)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "seuemail@gmail.com",
    pass: process.env.EMAIL_PASS || "suasenhaaplicativo",
  },
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
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

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito ao administrador" });
  }
  next();
};

const createRateLimiter = ({ windowMs, max, message }) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    const key =
      req.user?.id || req.ip || req.socket?.remoteAddress || "anonymous";
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (requestCounts.get(key) || []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (timestamps.length >= max) {
      return res.status(429).json({ error: message });
    }

    timestamps.push(now);
    requestCounts.set(key, timestamps);
    next();
  };
};

const confirmDegreeRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message:
    "Muitas confirmações de grau em pouco tempo. Tente novamente em instantes.",
});

const formatBirthDatePassword = (birthDate) => {
  if (!birthDate || typeof birthDate !== "string") {
    return null;
  }

  const value = birthDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}${month}${year}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${day}${month}${year}`;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = String(parsedDate.getFullYear());
  return `${day}${month}${year}`;
};

const syncStudentAccessUser = async (student) => {
  if (!student?.email) {
    return null;
  }

  const password = formatBirthDatePassword(student.birthDate);
  if (!password) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const studentId = student._id.toString();
  const existingUser = await User.findOne({ studentId });

  if (existingUser) {
    existingUser.email = student.email;
    existingUser.password = hashedPassword;
    existingUser.name = student.name;
    existingUser.role = "student";
    existingUser.studentId = studentId;
    await existingUser.save();
    return existingUser;
  }

  const user = new User({
    email: student.email,
    password: hashedPassword,
    role: "student",
    name: student.name,
    studentId,
  });
  await user.save();
  return user;
};

const syncExistingStudentAccessUsers = async () => {
  const students = await Student.find({ email: { $exists: true, $ne: null } });
  let syncedCount = 0;

  for (const student of students) {
    const syncedUser = await syncStudentAccessUser(student);
    if (syncedUser) {
      syncedCount += 1;
    }
  }

  return syncedCount;
};

const syncPrimaryAdminCredentials = async () => {
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    return "skipped";
  }

  const admins = await User.find({ role: "admin" });
  const targetAdmin =
    admins.find((admin) => admin.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) ||
    admins.find((admin) => admin.email === "admin@graciebarra.com") ||
    admins[0];

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  if (targetAdmin) {
    targetAdmin.email = DEFAULT_ADMIN_EMAIL;
    targetAdmin.password = hashedPassword;
    if (!targetAdmin.name) {
      targetAdmin.name = "Professor Gabriel";
    }
    await targetAdmin.save();
    return "updated";
  }

  const created = new User({
    email: DEFAULT_ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
    name: "Professor Gabriel",
  });
  await created.save();
  return "created";
};

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "Variavel MONGODB_URI (ou DATABASE_URL) nao configurada no ambiente",
      );
    }

    await mongoose.connect(MONGODB_URI);
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
    email: { type: String, sparse: true, default: undefined },
    program: {
      type: String,
      enum: ["GBK", "GBKIDS", "GBKJUVENIL", "GB1", "GB2", "GB3"],
    },
    belt: {
      type: String,
      enum: [
        "White",
        "GreyWhite",
        "Grey",
        "GreyBlack",
        "YellowWhite",
        "Yellow",
        "YellowBlack",
        "OrangeWhite",
        "Orange",
        "OrangeBlack",
        "GreenWhite",
        "Green",
        "GreenBlack",
        "Blue",
        "Purple",
        "Brown",
        "Black",
      ],
    },
    degrees: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
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
    notificationState: {
      nearDegreeTarget: { type: Number, default: null },
      nearDegreeLastSentAt: { type: Date, default: null },
    },
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
    email: { type: String, required: true },
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
    program: String,
    programs: [
      {
        type: String,
        enum: ["GB1", "GB2", "GB3", "GBKIDS", "GBKJUVENIL"],
      },
    ],
    daysOfWeek: [Number],
    closedDates: [String],
  },
  { timestamps: true },
);

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: {
      type: String,
      enum: ["all", "students", "teachers", "admins"],
      default: "students",
    },
    targetStudentId: { type: String, default: null },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: { type: String, default: null },
    createdByRole: { type: String, default: null },
  },
  { timestamps: true },
);

// Models
const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);
const Notification = mongoose.model("Notification", notificationSchema);

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

const getStudentDegreeProgress = async (student) => {
  const weeksRequired = getWeeksRequiredForNextDegree(
    student.belt,
    student.degrees,
    student.program,
  );

  if (!weeksRequired) {
    return {
      isReadyForDegree: false,
      weeksRequired: null,
      weeksCompleted: 0,
      remainingTrainings: 0,
      nextDegree: student.degrees + 1,
    };
  }

  const allAttendances = await Attendance.find({
    studentId: student._id,
    confirmed: true,
  });

  const weeksCompleted = calculateCompletedWeeks(
    allAttendances,
    student.lastGraduationDate,
  );

  const remainingWeeks = Math.max(0, weeksRequired - weeksCompleted);
  const remainingTrainings = Math.ceil(remainingWeeks * 2);

  return {
    isReadyForDegree: weeksCompleted >= weeksRequired,
    weeksRequired,
    weeksCompleted,
    remainingTrainings,
    nextDegree: student.degrees + 1,
  };
};

const checkIfReadyForDegree = async (student) => {
  const progress = await getStudentDegreeProgress(student);
  return progress.isReadyForDegree;
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

        const remaining = weeksRequired - weeksCompleted;
        const isReady = weeksCompleted >= weeksRequired;
        const isPenultimate = !isReady && remaining <= 1 && weeksCompleted > 0;

        if (isReady || isPenultimate) {
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
            isPenultimate,
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
    const savedStudent = await student.save();
    await syncStudentAccessUser(savedStudent);
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Dados já cadastrados no sistema." });
    }
    res
      .status(400)
      .json({ error: "Ocorreu um erro inesperado ao salvar os dados." });
  }
});

app.put("/api/students/:id", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    await syncStudentAccessUser(student);
    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Dados já cadastrados no sistema." });
    }
    res
      .status(400)
      .json({ error: "Ocorreu um erro inesperado ao salvar os dados." });
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

app.patch(
  "/api/students/:id/active",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { active } = req.body;
      if (typeof active !== "boolean") {
        return res
          .status(400)
          .json({ error: "Campo active deve ser booleano" });
      }

      const student = await Student.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true },
      );

      if (!student) return res.status(404).json({ error: "Student not found" });

      await syncStudentAccessUser(student);
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

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

    // Nota: não acionamos mais a confirmação automática de grau ao confirmar presenças.
    // A confirmação do grau agora deve ser feita explicitamente via endpoint dedicado.

    res.json(attendance);
  } catch (error) {
    console.error("Erro ao atualizar presença:", error);
    res.status(400).json({ error: error.message });
  }
});

// Permitir que professores ou administradores confirmem manualmente o grau de um aluno
const requireTeacherOrAdmin = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "teacher") return next();
  return res
    .status(403)
    .json({ error: "Acesso restrito a professores e administradores" });
};

// Confirmar grau manualmente sem alterar presenças
app.post(
  "/api/students/:id/confirm-degree",
  authenticateToken,
  requireTeacherOrAdmin,
  confirmDegreeRateLimit,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      // Data fornecida no corpo ou hoje
      const providedDate = req.body?.date;
      let isoDate;
      if (providedDate) {
        const d = new Date(providedDate);
        isoDate = !Number.isNaN(d.getTime())
          ? d.toISOString().split("T")[0]
          : null;
      }
      if (!isoDate) isoDate = new Date().toISOString().split("T")[0];

      student.degrees = (student.degrees || 0) + 1;
      student.lastGraduationDate = isoDate;
      student.notificationState = {
        nearDegreeTarget: null,
        nearDegreeLastSentAt: null,
      };

      student.specialDates = student.specialDates || [];
      student.specialDates.push({
        date: isoDate,
        type: "grade",
        notes: req.body?.notes || "Confirmado pelo professor",
      });

      await student.save();

      res.json({ success: true, student });
    } catch (error) {
      console.error("Erro ao confirmar grau manualmente:", error);
      res.status(400).json({ error: error.message });
    }
  },
);

const rollbackAttendanceDerivedStudentState = async (attendance) => {
  if (!attendance?.studentId) return;

  const student = await Student.findById(attendance.studentId);
  if (!student) return;

  const attendanceDate = new Date(attendance.date);
  if (Number.isNaN(attendanceDate.getTime())) return;

  const attendanceDateIso = attendanceDate.toISOString().split("T")[0];
  const hasAutoGrade = student.specialDates?.some(
    (sd) =>
      sd.type === "grade" &&
      sd.date === attendanceDateIso &&
      typeof sd.notes === "string" &&
      sd.notes.includes("Confirmado automaticamente"),
  );

  if (!hasAutoGrade) return;

  student.specialDates = (student.specialDates || []).filter(
    (sd) =>
      !(
        sd.type === "grade" &&
        sd.date === attendanceDateIso &&
        typeof sd.notes === "string" &&
        sd.notes.includes("Confirmado automaticamente")
      ),
  );
  student.degrees = Math.max(0, (student.degrees || 0) - 1);

  const remainingRelevantDates = (student.specialDates || [])
    .filter((sd) => sd.type === "grade" || sd.type === "graduation")
    .map((sd) => sd.date)
    .sort();

  student.lastGraduationDate = remainingRelevantDates.at(-1) || "";

  await student.save();
};

app.delete("/api/attendance/:id", authenticateToken, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    await rollbackAttendanceDerivedStudentState(attendance);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error("Erro ao excluir presença:", error);
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

app.post(
  "/api/notifications",
  authenticateToken,
  requireTeacherOrAdmin,
  confirmDegreeRateLimit,
  async (req, res) => {
    try {
      const {
        title,
        message,
        audience = "students",
        targetStudentId = null,
      } = req.body;

      if (!title?.trim() || !message?.trim()) {
        return res
          .status(400)
          .json({ error: "Titulo e mensagem sao obrigatorios" });
      }

      const author = await mongoose
        .model("User")
        .findById(req.user.id)
        .select("name")
        .lean();

      const notification = new Notification({
        title: title.trim(),
        message: message.trim(),
        audience,
        targetStudentId,
        createdByUserId: req.user.id,
        createdByName: author?.name || null,
        createdByRole: req.user.role || null,
      });

      const savedNotification = await notification.save();
      res.status(201).json(savedNotification);
    } catch (error) {
      console.error("Erro ao criar notificacao interna:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

app.get("/api/notifications/recent", authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "5", 10) || 5, 20);
    const userRole = req.user?.role;
    const studentId = req.user?.studentId || null;

    const query =
      userRole === "student"
        ? {
            $or: [
              { audience: "all" },
              { audience: "students" },
              ...(studentId ? [{ targetStudentId: studentId }] : []),
            ],
          }
        : {};

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error("Erro ao buscar notificacoes recentes:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete(
  "/api/notifications/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  async (req, res) => {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id);

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({ success: true, notification });
    } catch (error) {
      console.error("Erro ao excluir notificacao:", error);
      res.status(400).json({ error: error.message });
    }
  },
);

// User/Auth Routes
app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Senha atual e nova senha são obrigatórias." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = `${email || ""}`.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email e senha sao obrigatorios" });
    }

    // Busca TODOS os usuários com este email
    const users = await User.find({ email: normalizedEmail });

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    let authenticatedUser = null;
    let validUsersFound = [];

    // Precisamos checar a senha, pode ser que múltiplas contas tenham a mesma senha
    // ou se o usuário logou, ele tem a senha que bate com pelo menos um.
    for (const user of users) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        if (!authenticatedUser) authenticatedUser = user;
        validUsersFound.push(user);
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (authenticatedUser.role === "student" && authenticatedUser.studentId) {
      const linkedStudent = await Student.findById(authenticatedUser.studentId);
      if (linkedStudent && linkedStudent.active === false) {
        return res.status(403).json({
          error:
            "Este aluno está inativo no sistema. Peça a reativação ao professor.",
        });
      }
    }

    // Retorna todos os perfis associados a essa mesma senha
    const profiles = users.map((u) => {
      const profileToken = jwt.sign(
        {
          id: u._id.toString(),
          email: u.email,
          role: u.role,
          studentId: u.studentId || null,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      return {
        id: u._id.toString(),
        email: u.email,
        role: u.role,
        name: u.name,
        studentId: u.studentId,
        token: profileToken,
      };
    });

    // O token assina o perfil "principal" (o primeiro encontrado).
    // O front-end lidará com a troca depois.
    const activeProfile =
      profiles.find(
        (profile) => profile.id === authenticatedUser._id.toString(),
      ) || profiles[0];

    res.json({
      token: activeProfile.token,
      user: activeProfile, // Perfil ativo por padrão
      profiles: profiles, // Todos os perfis associados à conta
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
        email: "gabriel.recreio@gmail.com",
        password: await bcrypt.hash("961433", 10),
        role: "admin",
        name: "Professor Gabriel",
      },
      {
        email: "joao@example.com",
        password: await bcrypt.hash("15031995", 10),
        role: "student",
        name: "João Silva",
        studentId: createdStudents[0]._id.toString(),
      },
      {
        email: "maria@example.com",
        password: await bcrypt.hash("22071998", 10),
        role: "student",
        name: "Maria Santos",
        studentId: createdStudents[1]._id.toString(),
      },
      {
        email: "carlos@example.com",
        password: await bcrypt.hash("30111992", 10),
        role: "student",
        name: "Carlos Oliveira",
        studentId: createdStudents[2]._id.toString(),
      },
      {
        email: "pedro@example.com",
        password: await bcrypt.hash("18022015", 10),
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
        admin: "gabriel.recreio@gmail.com / 961433",
        students:
          "joao@example.com, maria@example.com, carlos@example.com, pedro@example.com / data de nascimento (ddmmaaaa)",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
connectDB().then(async () => {
  try {
    // Drop old unique indexes if they exist to allow multiple profiles with same email
    await User.collection.dropIndex("email_1").catch(() => {});
    await Student.collection.dropIndex("email_1").catch(() => {});

    const syncedCount = await syncExistingStudentAccessUsers();
    console.log(`🔄 Perfis de alunos sincronizados: ${syncedCount}`);

    const adminSyncStatus = await syncPrimaryAdminCredentials();
    console.log(`👤 Perfil admin sincronizado: ${adminSyncStatus}`);
  } catch (e) {
    console.log("Not possible to drop indexes, might not exist.");
  }

  // Se a build web existir, sirva os arquivos estáticos da pasta /dist (SPA)
  const distPath = path.resolve("./dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse pelo celular em http://SEU_IP_LOCAL:${PORT}`);
  });
});
