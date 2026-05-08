import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o JSON de alunos
const alunosPath = path.join(__dirname, "AlunosGB.json");
const alunos = JSON.parse(fs.readFileSync(alunosPath, "utf-8"));

// Mapear faixas em português para inglês
const beltMap = {
  BRANCA: "White",
  "CINZA/BRANCA": "Grey",
  "AMARELA/PRETA": "Yellow",
  AMARELA: "Orange",
  VERDE: "Green",
  AZUL: "Blue",
  ROXA: "Purple",
  MARROM: "Brown",
  PRETA: "Black",
  CINZA: "Grey",
  "Sem Faixa": "White",
};

function formatBirthDatePassword(birthDate) {
  if (!birthDate || birthDate === "N/A") {
    return "MUDAR_MANUALMENTE";
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

  return value.replace(/\D/g, "").slice(0, 8) || "MUDAR_MANUALMENTE";
}

// Determinar programa baseado em faixa e idade
function determineProgram(faixa, graus, birthDate) {
  const faixaClean = faixa.trim().toUpperCase();

  // Remover "- X Graus" da faixa se existir
  const faixaBase = faixaClean.split(" - ")[0].trim();

  // Faixas avançadas (Azul para cima) -> GB3
  if (["AZUL", "ROXA", "MARROM", "PRETA", "CINZA/PRETA"].includes(faixaBase)) {
    return "GB3";
  }

  // Calcular idade
  let age = null;
  if (birthDate && birthDate !== "N/A") {
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }
    } catch (e) {
      console.warn(`⚠️ Data de nascimento inválida para ${birthDate}`);
      age = null;
    }
  }

  // Faixa Branca
  if (faixaBase.includes("BRANCA")) {
    if (age === null) {
      return "GBK"; // Sem idade definida, assume GBK
    }

    if (age >= 16) {
      // Maior ou igual a 16: GB1 ou GB2 dependendo dos graus
      if (graus >= 2) {
        return "GB2";
      }
      return "GB1";
    } else {
      // Menor de 16
      return "GBK";
    }
  }

  // Faixas coloridas (exceto Azul, Roxa, Marrom, Preta)
  // Cinza/Branca, Amarela/Preta, etc -> GBK
  return "GBK";
}

// Processar alunos
const studentsToImport = alunos
  .map((aluno) => {
    const faixaComGraus = aluno.Graduação || "Sem Faixa";
    const grausMatch = faixaComGraus.match(/(\d+)\s*Graus/);
    const graus = grausMatch ? parseInt(grausMatch[1]) : 0;

    // Extrair faixa base
    const faixaBase = faixaComGraus.split(" - ")[0].trim();
    const belt = beltMap[faixaBase] || "White";

    // Determinar programa
    const program = determineProgram(
      faixaComGraus,
      graus,
      aluno["Data de Nascimento"],
    );

    // Email e senha
    const email = aluno.Email && aluno.Email !== "N/A" ? aluno.Email : null;
    const password = formatBirthDatePassword(aluno["Data de Nascimento"]);

    return {
      name: aluno.Nome,
      email: email,
      program: program,
      belt: belt,
      degrees: graus,
      birthDate:
        aluno["Data de Nascimento"] && aluno["Data de Nascimento"] !== "N/A"
          ? aluno["Data de Nascimento"]
          : null,
      password: password, // Para referência - será hasheado na API
      qrCode: aluno["QR Code"] || null, // Manter QR code existente
      skipEmailPassword:
        !email ||
        !aluno["Data de Nascimento"] ||
        aluno["Data de Nascimento"] === "N/A",
    };
  })
  .filter((s) => s.name); // Remover registros sem nome

// Gerar relatório
console.log("\n=== RELATÓRIO DE IMPORTAÇÃO DE ALUNOS ===\n");
console.log(`Total de alunos a importar: ${studentsToImport.length}`);

// Contar por programa
const programCount = {};
studentsToImport.forEach((s) => {
  programCount[s.program] = (programCount[s.program] || 0) + 1;
});
console.log("\nPor Programa:");
Object.entries(programCount).forEach(([program, count]) => {
  console.log(`  ${program}: ${count}`);
});

// Contar por faixa
const beltCount = {};
studentsToImport.forEach((s) => {
  beltCount[s.belt] = (beltCount[s.belt] || 0) + 1;
});
console.log("\nPor Faixa:");
Object.entries(beltCount).forEach(([belt, count]) => {
  console.log(`  ${belt}: ${count}`);
});

// Alunos sem email ou data de nascimento
const skipCount = studentsToImport.filter((s) => s.skipEmailPassword).length;
console.log(
  `\n⚠️ Alunos sem email ou data de nascimento completos: ${skipCount}`,
);

// Salvar arquivo de importação
const importPath = path.join(__dirname, "alunos-import.json");
fs.writeFileSync(importPath, JSON.stringify(studentsToImport, null, 2));
console.log(`\n✅ Arquivo de importação salvo: ${importPath}`);

// Gerar arquivo SQL comentado para referência
const sqlPath = path.join(__dirname, "alunos-import.sql");
const sqlContent = `-- Script de importação de alunos para MongoDB via API
-- Use o arquivo alunos-import.json com o script de inserção em lote

-- Resumo:
-- Total de alunos: ${studentsToImport.length}
-- Por Programa:
${Object.entries(programCount)
  .map(([p, c]) => `--   ${p}: ${c}`)
  .join("\n")}
-- Por Faixa:
${Object.entries(beltCount)
  .map(([b, c]) => `--   ${b}: ${c}`)
  .join("\n")}

-- Exemplo de requisição cURL para um aluno:
-- curl -X POST http://localhost:3001/api/students \\
--   -H "Authorization: Bearer YOUR_TOKEN" \\
--   -H "Content-Type: application/json" \\
--   -d '{
--     "name": "Nome do Aluno",
--     "email": "email@example.com",
--     "program": "GB1",
--     "belt": "White",
--     "degrees": 0,
--     "birthDate": "2010-01-15"
--   }'
`;

fs.writeFileSync(sqlPath, sqlContent);
console.log(`📄 Arquivo de referência salvo: ${sqlPath}`);

console.log("\n=== PRÓXIMOS PASSOS ===");
console.log("1. Use o arquivo 'alunos-import.json' para importar em lote");
console.log(
  "2. Execute o script 'bulk-import-students.js' para inserir todos no BD",
);
console.log(
  "3. Alunos sem email/data de nascimento precisam ser ajustados manualmente\n",
);
