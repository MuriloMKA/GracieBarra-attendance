#!/usr/bin/env node

/**
 * 🚀 QUICK START - Importação de Alunos em Lote
 *
 * Este script executa TODO o processo de importação
 * em uma única linha de comando
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, name) {
  return new Promise((resolve, reject) => {
    log("cyan", `\n▶️  Executando: ${name}`);
    const proc = spawn("node", [path.join(__dirname, command), ...args], {
      stdio: "inherit",
    });

    proc.on("close", (code) => {
      if (code === 0) {
        log("green", `✅ ${name} concluído`);
        resolve();
      } else {
        log("red", `❌ ${name} falhou com código ${code}`);
        reject(new Error(`${name} falhou`));
      }
    });

    proc.on("error", (error) => {
      log("red", `❌ Erro ao executar ${name}: ${error.message}`);
      reject(error);
    });
  });
}

async function main() {
  console.clear();
  log(
    "bright",
    "╔═════════════════════════════════════════════════════════════╗",
  );
  log(
    "bright",
    "║    🎓 IMPORTAÇÃO DE ALUNOS - GRACIE BARRA ACADEMY          ║",
  );
  log(
    "bright",
    "╚═════════════════════════════════════════════════════════════╝",
  );

  try {
    // Etapa 1: Preparação
    log("blue", "\n📋 ETAPA 1: PREPARAÇÃO DE DADOS");
    log(
      "yellow",
      "Processando arquivo CSV → JSON com classificação automática...",
    );

    if (!fs.existsSync(path.join(__dirname, "AlunosGB.json"))) {
      log("red", "❌ Arquivo AlunosGB.json não encontrado!");
      process.exit(1);
    }

    await runCommand("import-students.js", [], "Processamento de dados");

    // Etapa 2: Relatório
    log("blue", "\n📊 ETAPA 2: GERAR RELATÓRIO DE AJUSTES");
    await runCommand("report-missing-data.js", [], "Geração de relatório");

    // Etapa 3: Importação
    log("blue", "\n💾 ETAPA 3: IMPORTAÇÃO NO BANCO DE DADOS");
    log("yellow", "⚠️  Certifique-se que:");
    log("yellow", "   • Arquivo .env está configurado com MONGODB_URI");
    log("yellow", "   • MongoDB está acessível");
    log("yellow", "   • Você tem permissão de escrita no banco\n");

    const answer = await askQuestion(
      "Deseja continuar com a importação? (s/n): ",
    );

    if (answer.toLowerCase() !== "s" && answer.toLowerCase() !== "sim") {
      log("yellow", "\n⏸️  Importação cancelada");
      log(
        "cyan",
        "Para importar depois, execute: node bulk-import-students.js",
      );
      process.exit(0);
    }

    await runCommand("bulk-import-students.js", [], "Importação no MongoDB");

    // Resumo Final
    log(
      "green",
      "\n╔═════════════════════════════════════════════════════════════╗",
    );
    log(
      "green",
      "║                    ✅ PROCESSO CONCLUÍDO!                  ║",
    );
    log(
      "green",
      "╚═════════════════════════════════════════════════════════════╝",
    );

    log("cyan", "\n📁 Arquivos Gerados:");
    log("cyan", "  • alunos-import.json              ← Dados para importação");
    log("cyan", "  • alunos-ajustes-manuais.csv      ← Alunos sem email (18)");
    log("cyan", "  • IMPORTACAO_ALUNOS.md            ← Documentação completa");

    log("yellow", "\n📝 PRÓXIMOS PASSOS:");
    log("yellow", "  1. Verifique se todos os 132 alunos foram importados");
    log(
      "yellow",
      "  2. Adicione emails nos 18 alunos listados em alunos-ajustes-manuais.csv",
    );
    log("yellow", "  3. Teste login com um aluno criado");
    log("yellow", "  4. Verifique os QR codes mantidos de cada aluno");

    log("cyan", "\n🔗 Documentação completa: ./IMPORTACAO_ALUNOS.md");
  } catch (error) {
    log("red", `\n❌ Erro durante processo: ${error.message}`);
    process.exit(1);
  }
}

// Helper para fazer pergunta interativa
function askQuestion(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

main();
