import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { configureMongoSrvDns } from "./mongo-srv-dns.js";

dotenv.config();

configureMongoSrvDns();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const lastGraduationPath = path.join(__dirname, "ultimo_grau_alunos.json");

const studentSchema = new mongoose.Schema(
  {
    name: String,
    lastGraduationDate: String,
    specialDates: [
      {
        date: String,
        type: { type: String, enum: ["graduation", "grade"] },
        notes: String,
      },
    ],
  },
  { strict: false },
);

const Student = mongoose.model("Student", studentSchema);

const decodeHtmlEntities = (value) =>
  String(value || "").replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(Number(code)),
  );

const normalizeStudentName = (value) =>
  decodeHtmlEntities(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const parseBrazilianDateToIso = (value) => {
  if (!value || value === "sem graus") {
    return null;
  }

  const normalized = String(value).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  return null;
};

const mergeSpecialDates = (existingDates = [], gradeDate) => {
  if (!gradeDate) {
    return existingDates || [];
  }

  const key = `grade|${gradeDate}`;
  const merged = [...(existingDates || [])];
  const alreadyHasGrade = merged.some(
    (entry) => `${entry.type || ""}|${entry.date || ""}` === key,
  );

  if (!alreadyHasGrade) {
    merged.push({
      date: gradeDate,
      type: "grade",
      notes: "Último grau importado",
    });
  }

  return merged;
};

const connectDB = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI (ou DATABASE_URL) não configurada no .env");
  }

  await mongoose.connect(MONGODB_URI);
};

async function syncLastGraduationDates() {
  try {
    if (!fs.existsSync(lastGraduationPath)) {
      throw new Error(`Arquivo não encontrado: ${lastGraduationPath}`);
    }

    await connectDB();

    const rawDates = JSON.parse(fs.readFileSync(lastGraduationPath, "utf-8"));
    const entries = Object.entries(rawDates)
      .map(([name, date]) => ({
        name,
        normalizedName: normalizeStudentName(name),
        lastGraduationDate: parseBrazilianDateToIso(date),
      }))
      .filter((entry) => entry.lastGraduationDate);

    const students = await Student.find();
    const studentsByName = new Map(
      students.map((student) => [normalizeStudentName(student.name), student]),
    );

    let updated = 0;
    let skipped = 0;
    const notFound = [];

    for (const entry of entries) {
      const student = studentsByName.get(entry.normalizedName);
      if (!student) {
        notFound.push(entry.name);
        continue;
      }

      student.lastGraduationDate = entry.lastGraduationDate;
      student.specialDates = mergeSpecialDates(
        student.specialDates,
        entry.lastGraduationDate,
      );
      await student.save();
      updated += 1;
    }

    skipped = Object.values(rawDates).filter(
      (value) => value === "sem graus",
    ).length;

    console.log("\n=== SINCRONIZAÇÃO DE ÚLTIMO GRAU ===");
    console.log(`✅ Alunos atualizados: ${updated}`);
    console.log(`⚪ Alunos sem grau na faixa: ${skipped}`);
    console.log(`⚠️ Alunos não encontrados: ${notFound.length}`);

    if (notFound.length > 0) {
      console.log("\n=== NOMES NÃO ENCONTRADOS ===");
      notFound.forEach((name) => console.log(` - ${name}`));
    }
  } catch (error) {
    console.error("❌ Erro ao sincronizar últimos graus:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

syncLastGraduationDates();
