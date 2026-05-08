import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { configureMongoSrvDns } from "../mongo-srv-dns.js";

dotenv.config();
configureMongoSrvDns();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!MONGODB_URI) {
  console.error("MONGODB_URI não configurada no .env");
  process.exit(1);
}

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true, default: undefined },
  program: String,
  belt: String,
  degrees: Number,
  lastGraduationDate: String,
  nextDegreeDate: String,
  birthDate: String,
  specialDates: Array,
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  name: String,
  studentId: String,
});

const Student = mongoose.model("Student", studentSchema);
const User = mongoose.model("User", userSchema);

function formatBirthDatePassword(birthDate) {
  if (!birthDate || typeof birthDate !== "string") return null;
  const value = birthDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}${month}${year}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${day}${month}${year}`;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : null;
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Conectado ao MongoDB");

    const students = await Student.find({}).lean();
    console.log(`Encontrados ${students.length} alunos`);

    let created = 0;
    let updated = 0;
    let skippedNoEmail = 0;
    let skippedNoBirth = 0;

    for (const s of students) {
      const email = s.email;
      const birth = s.birthDate;
      const pwd = formatBirthDatePassword(birth);
      if (!email) {
        skippedNoEmail++;
        console.log(`PULAR: ${s.name} (sem email)`);
        continue;
      }
      if (!pwd) {
        skippedNoBirth++;
        console.log(
          `PULAR: ${s.name} (${email}) - sem data de nascimento válida`,
        );
        continue;
      }

      const hashed = await bcrypt.hash(pwd, 10);

      // Procurar usuário por studentId ou email
      const studentIdStr = s._id ? s._id.toString() : null;
      let user = null;
      if (studentIdStr) user = await User.findOne({ studentId: studentIdStr });
      if (!user) user = await User.findOne({ email });

      if (user) {
        user.email = email;
        user.password = hashed;
        user.name = s.name;
        user.studentId = studentIdStr;
        await user.save();
        updated++;
        console.log(`ATUALIZADO: ${s.name} <${email}>  senha=${pwd}`);
      } else {
        const newUser = new User({
          email,
          password: hashed,
          role: "student",
          name: s.name,
          studentId: studentIdStr,
        });
        await newUser.save();
        created++;
        console.log(`CRIADO: ${s.name} <${email}>  senha=${pwd}`);
      }
    }

    console.log("\n=== RESUMO ===");
    console.log(`Criados: ${created}`);
    console.log(`Atualizados: ${updated}`);
    console.log(`Pulados (sem email): ${skippedNoEmail}`);
    console.log(`Pulados (sem data de nascimento válida): ${skippedNoBirth}`);

    process.exit(0);
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

main();
