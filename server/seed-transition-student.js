/**
 * Script para popular um aluno que transiciona de juvenil (GBK) para adulto (GB1)
 * Começou como criança na faixa branca, evoluiu até laranja, depois aos 16 foi para azul
 * Uso: node seed-transition-student.js
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

// Gerar presenças realísticas
const generateAttendances = (studentId, startDate, endDate) => {
  const attendances = [];
  const classes = [
    { name: "Infantil", time: "16:00", id: "class-1" },
    { name: "Infantil", time: "17:00", id: "class-2" },
    { name: "Juvenil", time: "18:00", id: "class-3" },
  ];

  let current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();

    // Segunda (1), Quarta (3), Sexta (5) - 85% de presença
    if ([1, 3, 5].includes(dayOfWeek)) {
      if (Math.random() < 0.85) {
        const classData = classes[Math.floor(Math.random() * classes.length)];
        attendances.push({
          studentId,
          date: new Date(current),
          classId: classData.id,
          className: classData.name,
          classTime: classData.time,
          confirmed: true,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return attendances;
};

// Executar seed
const seedTransitionStudent = async () => {
  try {
    console.log("\n🚀 Iniciando população de aluno em transição...\n");

    // Aluno que transicionou de juvenil para adulto
    const transitionStudent = new Student({
      name: "Lucas Ferreira",
      email: "lucas.ferreira@example.com",
      program: "GB1",
      belt: "Blue",
      degrees: 2,
      lastGraduationDate: "2026-04-20",
      nextDegreeDate: "2026-08-20",
      birthDate: "2010-03-15", // Faz 16 anos em março (estava em GBK, passou para GB1 em abril)
      specialDates: [
        // Faixa Branca (jan-2026)
        {
          date: "2026-01-25",
          type: "grade",
          notes: "1° Grau - Confirmado automaticamente",
        },
        {
          date: "2026-02-22",
          type: "grade",
          notes: "2° Grau - Confirmado automaticamente",
        },
        // Graduação para Faixa Cinza (fev 2026)
        {
          date: "2026-02-28",
          type: "graduation",
          notes: "BELT:Grey|Evoluindo para próxima faixa",
        },
        // Faixa Cinza (mar-2026)
        {
          date: "2026-03-21",
          type: "grade",
          notes: "1° Grau - Confirmado automaticamente",
        },
        // Graduação para Faixa Laranja (mar 2026)
        {
          date: "2026-03-28",
          type: "graduation",
          notes: "BELT:Orange|Continuando na progressão",
        },
        // Faixa Laranja (abr-2026) - momento da transição!
        {
          date: "2026-04-18",
          type: "grade",
          notes: "1° Grau - Confirmado automaticamente",
        },
        // ⭐ TRANSIÇÃO JUVENIL → ADULTO (Laranja para Azul)
        // Aos 16 anos, passa para faixa azul (programa GB1)
        {
          date: "2026-04-20",
          type: "graduation",
          notes: "BELT:Blue|Transição para adulto - 16 anos",
        },
        // Faixa Azul (adulto) - apr/mai 2026
        {
          date: "2026-04-28",
          type: "grade",
          notes: "1° Grau - Confirmado automaticamente",
        },
        {
          date: "2026-05-02",
          type: "grade",
          notes: "2° Grau - Confirmado automaticamente",
        },
      ],
    });

    const savedStudent = await transitionStudent.save();
    console.log(
      `✅ Aluno criado: ${savedStudent.name} (ID: ${savedStudent._id})`,
    );

    // Criar usuário do aluno
    const hashedPassword = await bcrypt.hash("aluno123", 10);
    const studentUser = new User({
      email: "lucas.ferreira@example.com",
      password: hashedPassword,
      role: "student",
      name: "Lucas Ferreira",
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
    console.log("\n📋 RESUMO DO ALUNO EM TRANSIÇÃO:\n");
    console.log(`Nome: ${transitionStudent.name}`);
    console.log(`Email: ${transitionStudent.email}`);
    console.log(`Data de nascimento: 15/03/2010 (fez 16 em março)`);
    console.log(`\n📚 Progressão de Faixa:`);
    console.log(`  • Janeiro-Fevereiro: Faixa Branca (GBK) - 2 graus`);
    console.log(`  • Fevereiro-Março: Faixa Cinza (GBK) - 1 grau`);
    console.log(`  • Março-Abril: Faixa Laranja (GBK) - 1 grau`);
    console.log(
      `  • ⭐ 20 de Abril: TRANSIÇÃO JUVENIL → ADULTO (Laranja → Azul)`,
    );
    console.log(`  • Abril-Maio: Faixa Azul (GB1) - 2 graus`);
    console.log(
      `\n✅ Faixa atual: ${transitionStudent.belt} | Programa: ${transitionStudent.program}`,
    );
    console.log(`✅ Total de presenças: ${savedAttendances.length}`);
    console.log(`✅ Total de graus: 6`);
    console.log(`✅ Total de graduações: 4`);
    console.log(`\n🔑 Credenciais para login:\n`);
    console.log(`Email: lucas.ferreira@example.com`);
    console.log(`Senha: aluno123`);
    console.log(
      `\n🎯 TESTE SUGERIDO:\n1. Log in como admin\n2. Vá para o aluno Lucas\n3. Clique nos botões de histórico: verá "Faixa Branca", "Faixa Cinza", "Faixa Laranja", "Faixa Azul"\n4. Clique em cada um para ver a ficha de cada período\n5. Note como o programa passa de GBK para GB1 na transição\n6. As futuras graduações serão apenas de faixas adultas!\n`,
    );

    console.log("\n✨ Aluno em transição populado com sucesso!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao popular dados:", error.message);
    process.exit(1);
  }
};

// Executar
(async () => {
  await connectDB();
  await seedTransitionStudent();
})();
