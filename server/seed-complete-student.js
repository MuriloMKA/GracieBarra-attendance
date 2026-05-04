/**
 * Script para popular um aluno completo com histórico desde janeiro
 * Uso: node seed-complete-student.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

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

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    name: String,
    studentId: String,
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

const Student = mongoose.model("Student", studentSchema);
const User = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
};

// Gerar presenças realísticas desde janeiro
const generateAttendances = (studentId, startDate, endDate) => {
  const attendances = [];
  const classes = [
    { name: "Fundamentos", time: "19:00", id: "class-1" },
    { name: "Avançado", time: "20:30", id: "class-2" },
    { name: "Crianças", time: "17:00", id: "class-3" },
  ];

  let current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();

    // Segunda (1), Quarta (3), Sexta (5) - 80% de presença
    if ([1, 3, 5].includes(dayOfWeek)) {
      if (Math.random() < 0.8) {
        const classData = classes[Math.floor(Math.random() * classes.length)];
        attendances.push({
          studentId,
          date: new Date(current),
          classId: classData.id,
          className: classData.name,
          classTime: classData.time,
          confirmed: true, // Todas confirmadas para simular realismo
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return attendances;
};

// Executar seed
const seedCompleteStudent = async () => {
  try {
    console.log("\n🚀 Iniciando população de aluno completo...\n");

    // Criar aluno com progressão realista
    const completedStudent = new Student({
      name: "Rafael Mendes",
      email: "rafael.mendes@example.com",
      program: "GB1",
      belt: "Blue",
      degrees: 1,
      lastGraduationDate: "2026-04-10",
      nextDegreeDate: "2026-08-10",
      birthDate: "1990-05-20",
      specialDates: [
        // Graduação de Faixa Branca para Azul em Abril
        {
          date: "2026-04-10",
          type: "graduation",
          notes: "BELT:Blue|Promovido para Faixa Azul - Excelente desempenho",
        },
        // Graus automáticos após graduação
        {
          date: "2026-04-12",
          type: "grade",
          notes: "1° Grau - Confirmado automaticamente",
        },
        {
          date: "2026-05-04",
          type: "grade",
          notes: "2° Grau - Confirmado automaticamente",
        },
      ],
    });

    const savedStudent = await completedStudent.save();
    console.log(
      `✅ Aluno criado: ${savedStudent.name} (ID: ${savedStudent._id})`,
    );

    // Criar usuário do aluno
    const hashedPassword = await bcrypt.hash("aluno123", 10);
    const studentUser = new User({
      email: "rafael.mendes@example.com",
      password: hashedPassword,
      role: "student",
      name: "Rafael Mendes",
      studentId: savedStudent._id.toString(),
    });

    await studentUser.save();
    console.log("✅ Usuário do aluno criado");

    // Gerar presenças desde janeiro
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-05-03");

    const attendances = generateAttendances(
      savedStudent._id,
      startDate,
      endDate,
    );
    const savedAttendances = await Attendance.insertMany(attendances);
    console.log(`✅ ${savedAttendances.length} presenças criadas (jan-maio)`);

    // Resumo
    console.log("\n📋 RESUMO DO ALUNO COMPLETO:\n");
    console.log(`Nome: ${completedStudent.name}`);
    console.log(`Email: ${completedStudent.email}`);
    console.log(`Faixa atual: ${completedStudent.belt}`);
    console.log(`Programa: ${completedStudent.program}`);
    console.log(`Graus atuais: ${completedStudent.degrees}`);
    console.log(
      `Data da última graduação: ${completedStudent.lastGraduationDate}`,
    );
    console.log(
      `Próxima data de grau estimada: ${completedStudent.nextDegreeDate}`,
    );
    console.log(`Total de presenças: ${savedAttendances.length}`);
    console.log(
      `Graduações marcadas: ${completedStudent.specialDates.filter((sd) => sd.type === "graduation").length}`,
    );
    console.log(
      `Graus automáticos: ${completedStudent.specialDates.filter((sd) => sd.type === "grade").length}`,
    );
    console.log(`\n🔑 Credenciais para login:\n`);
    console.log(`Email: rafael.mendes@example.com`);
    console.log(`Senha: aluno123`);

    console.log("\n✨ Aluno completo populado com sucesso!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao popular dados:", error.message);
    process.exit(1);
  }
};

// Executar
(async () => {
  await connectDB();
  await seedCompleteStudent();
})();
