import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { configureMongoSrvDns } from "./mongo-srv-dns.js";

dotenv.config();

configureMongoSrvDns();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI (ou DATABASE_URL) não configurada no .env");
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
    email: { type: String, unique: true, sparse: true, default: undefined },
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
    qrCode: String,
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

const Student = mongoose.model("Student", studentSchema);
const User = mongoose.model("User", userSchema);

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

  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 8 ? digitsOnly.slice(0, 8) : null;
};

const ensureStudentEmailIndex = async () => {
  const existingIndexes = await Student.collection.indexes().catch(() => []);
  const emailIndex = existingIndexes.find((index) => index.name === "email_1");

  if (emailIndex) {
    const hasSparse = Boolean(emailIndex.sparse);
    if (!hasSparse) {
      await Student.collection.dropIndex("email_1").catch(() => {});
    } else {
      return;
    }
  }

  await Student.collection.createIndex(
    { email: 1 },
    { unique: true, sparse: true, name: "email_1" },
  );
};

// Função para fazer import em lote
async function bulkImportStudents() {
  try {
    await connectDB();
    await ensureStudentEmailIndex();

    // Ler arquivo de importação
    const importPath = path.join(__dirname, "alunos-import.json");
    if (!fs.existsSync(importPath)) {
      throw new Error(`Arquivo não encontrado: ${importPath}`);
    }

    const studentsData = JSON.parse(fs.readFileSync(importPath, "utf-8"));
    console.log(
      `\n📥 Iniciando importação de ${studentsData.length} alunos...\n`,
    );

    let createdStudents = 0;
    let createdUsers = 0;
    let skipped = 0;
    let errors = [];

    for (const data of studentsData) {
      try {
        // Verificar se aluno já existe por email
        if (data.email) {
          const existingStudent = await Student.findOne({ email: data.email });
          if (existingStudent) {
            console.log(`⏭️  Aluno já existe: ${data.name} (${data.email})`);
            skipped++;
            continue;
          }
        }

        // Criar estudante
        const studentPayload = {
          name: data.name,
          program: data.program,
          belt: data.belt,
          degrees: data.degrees,
          birthDate: data.birthDate,
          qrCode: data.qrCode,
        };

        if (data.email) {
          studentPayload.email = data.email;
        }

        const student = new Student(studentPayload);

        const savedStudent = await student.save();
        console.log(`✅ Aluno criado: ${data.name} (${data.program})`);
        createdStudents++;

        // Criar usuário de acesso SE tiver email e data de nascimento válida
        const derivedPassword = formatBirthDatePassword(data.birthDate);
        if (data.email && derivedPassword) {
          try {
            const existingUser = await User.findOne({ email: data.email });
            if (!existingUser) {
              const hashedPassword = await bcrypt.hash(derivedPassword, 10);
              const user = new User({
                email: data.email,
                password: hashedPassword,
                name: data.name,
                studentId: savedStudent._id.toString(),
                role: "student",
              });
              await user.save();
              console.log(`   → Usuário de acesso criado: ${data.email}`);
              createdUsers++;
            } else {
              existingUser.password = await bcrypt.hash(derivedPassword, 10);
              existingUser.name = data.name;
              existingUser.studentId = savedStudent._id.toString();
              await existingUser.save();
              console.log(`   → ⚠️ Usuário já existe: ${data.email}`);
            }
          } catch (userError) {
            console.log(`   → ⚠️ Erro ao criar usuário: ${userError.message}`);
          }
        } else if (data.skipEmailPassword) {
          console.log(
            `   → ⚠️ Sem email/senha definidos - ajuste manualmente depois`,
          );
        }
      } catch (error) {
        const msg = `Erro ao processar ${data.name}: ${error.message}`;
        console.error(`   ❌ ${msg}`);
        errors.push({ aluno: data.name, erro: error.message });
      }
    }

    console.log("\n=== RESUMO DA IMPORTAÇÃO ===");
    console.log(`✅ Alunos criados: ${createdStudents}`);
    console.log(`✅ Usuários de acesso criados: ${createdUsers}`);
    console.log(`⏭️  Alunos ignorados (já existem): ${skipped}`);
    console.log(`❌ Erros: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n=== ERROS ENCONTRADOS ===");
      errors.forEach((e) => {
        console.log(`   ${e.aluno}: ${e.erro}`);
      });
    }

    console.log("\n=== PRÓXIMOS PASSOS ===");
    console.log("1. Verifique os alunos importados no banco");
    console.log(
      "2. Atualize manualmente os alunos sem email/data de nascimento",
    );
    console.log(
      "3. Gere novos QR codes se necessário (atualmente usando os existentes)",
    );
  } catch (error) {
    console.error("❌ Erro fatal:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Conexão com MongoDB encerrada");
  }
}

// Executar importação
bulkImportStudents();
