import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { configureMongoSrvDns } from "./mongo-srv-dns.js";

// Carrega as variáveis de ambiente
dotenv.config();

// Resolve problema comum de DNS Node.js com Mongo ATLAS
configureMongoSrvDns();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

// Esquemas mínimos necessários
const studentSchema = new mongoose.Schema({
  name: String,
});
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

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
const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

async function insertAttendances() {
  try {
    console.log("Conectando ao MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado com sucesso!\n");

    const rawData = fs.readFileSync("./presencas_2026.json", "utf8");
    const data = JSON.parse(rawData);

    let studentsFound = 0;
    let studentsMissing = [];
    let totalInserted = 0;

    for (const [studentName, presences] of Object.entries(data)) {
      const student = await Student.findOne({
        name: new RegExp("^" + studentName.trim() + "$", "i"),
      });

      if (!student) {
        studentsMissing.push(studentName);
        continue;
      }

      studentsFound++;
      console.log(`📌 Processando: ${student.name}`);
      let insertedForStudent = 0;

      for (const [dateStr, isPresent] of Object.entries(presences)) {
        if (isPresent === true) {
          const attendanceDate = new Date(`${dateStr}T12:00:00.000Z`);

          const startOfDay = new Date(attendanceDate);
          startOfDay.setUTCHours(0, 0, 0, 0);

          const endOfDay = new Date(attendanceDate);
          endOfDay.setUTCHours(23, 59, 59, 999);

          // Verifica se já não existe presença no mesmo dia para evitar duplicidade
          const existing = await Attendance.findOne({
            studentId: student._id,
            date: { $gte: startOfDay, $lte: endOfDay },
          });

          if (!existing) {
            await Attendance.create({
              studentId: student._id,
              date: attendanceDate,
              classId: "imported-2026",
              className: "Aula Importada",
              classTime: "00:00",
              confirmed: true,
            });
            insertedForStudent++;
            totalInserted++;
          }
        }
      }

      console.log(`   └─ ${insertedForStudent} novas presenças injetadas.`);
    }

    console.log("\n=================================");
    console.log("📊 RESUMO DE INJEÇÃO PRESEÇAS");
    console.log("=================================");
    console.log(`✅ Alunos encontrados: ${studentsFound}`);
    console.log(`✅ Total de presenças novas inseridas: ${totalInserted}`);
    console.log(
      `❌ Alunos não encontrados na base (${studentsMissing.length}):`,
    );
    studentsMissing.forEach((s) => console.log(`   - ${s}`));
  } catch (err) {
    console.error("❌ Erro durante injeção:", err.message);
  } finally {
    mongoose.disconnect();
    console.log("\nDesconectado do banco.");
  }
}

insertAttendances();
