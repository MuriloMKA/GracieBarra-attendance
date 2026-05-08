import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler dados de importação
const importPath = path.join(__dirname, "alunos-import.json");
const studentsData = JSON.parse(fs.readFileSync(importPath, "utf-8"));

// Filtrar alunos que precisam de ajustes
const needsAdjustment = studentsData.filter((s) => s.skipEmailPassword);

console.log("\n=== ALUNOS QUE PRECISAM DE AJUSTE MANUAL ===\n");
console.log(`Total: ${needsAdjustment.length} alunos\n`);

// Agrupar por tipo de problema
const noEmail = needsAdjustment.filter((s) => !s.email);
const noBirthDate = needsAdjustment.filter(
  (s) => !s.birthDate || s.birthDate === "N/A",
);
const both = needsAdjustment.filter(
  (s) => !s.email && (!s.birthDate || s.birthDate === "N/A"),
);

console.log(`Sem Email: ${noEmail.length}`);
console.log(`Sem Data de Nascimento: ${noBirthDate.length}`);
console.log(`Sem ambas informações: ${both.length}\n`);

// Gerar tabela em CSV para facilitar ajustes
const csvContent = [
  [
    "Nome",
    "Programa",
    "Faixa",
    "Graus",
    "Email",
    "Data de Nascimento",
    "Observações",
  ],
  ...needsAdjustment.map((s) => [
    s.name,
    s.program,
    s.belt,
    s.degrees,
    s.email || "FALTANDO",
    s.birthDate || "FALTANDO",
    `${!s.email ? "Sem Email; " : ""}${!s.birthDate || s.birthDate === "N/A" ? "Sem Data Nasc." : ""}`,
  ]),
]
  .map((row) => row.map((cell) => `"${cell}"`).join(","))
  .join("\n");

const csvPath = path.join(__dirname, "alunos-ajustes-manuais.csv");
fs.writeFileSync(csvPath, csvContent);
console.log(`📄 CSV gerado: ${csvPath}\n`);

// Listar alunos
console.log("=== LISTA DE ALUNOS QUE PRECISAM AJUSTES ===\n");
needsAdjustment.forEach((s, i) => {
  const issues = [];
  if (!s.email) issues.push("❌ Sem Email");
  if (!s.birthDate || s.birthDate === "N/A")
    issues.push("❌ Sem Data de Nascimento");

  console.log(`${i + 1}. ${s.name}`);
  console.log(`   Programa: ${s.program}`);
  console.log(`   Faixa: ${s.belt} (${s.degrees} graus)`);
  console.log(`   Problemas: ${issues.join(" | ")}`);
  console.log("");
});

console.log("\n=== INSTRUÇÕES PARA AJUSTE ===");
console.log("1. Abra o arquivo: alunos-ajustes-manuais.csv");
console.log(
  "2. Preencha os campos 'Email' e 'Data de Nascimento' conforme necessário",
);
console.log("3. Após preencher no CSV, atualize manualmente no banco de dados");
console.log("4. Ou use a API POST para adicionar dados faltantes por ID\n");
