#!/usr/bin/env node

/**
 * 🧪 TESTE DE CONEXÃO - MongoDB
 *
 * Valida se MongoDB está acessível antes de iniciar a importação
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { configureMongoSrvDns } from "./mongo-srv-dns.js";

dotenv.config();

configureMongoSrvDns();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

console.log("\n╔════════════════════════════════════════╗");
console.log("║     🧪 TESTE DE CONEXÃO MONGODB      ║");
console.log("╚════════════════════════════════════════╝\n");

async function testConnection() {
  try {
    if (!MONGODB_URI) {
      console.error("❌ ERRO: MONGODB_URI não configurada no .env");
      console.log("\n📝 Configure seu arquivo .env com:");
      console.log(
        "   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database",
      );
      return false;
    }

    console.log("🔍 Testando conexão com MongoDB...");
    console.log(
      `   URI (primeiros 50 chars): ${MONGODB_URI.substring(0, 50)}...`,
    );

    // Teste de conexão
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Conexão bem-sucedida!");

    // Informações do banco
    const adminDb = mongoose.connection.db.admin();
    const stats = await adminDb.command({ dbStats: 1 });

    console.log("\n📊 Informações do Banco:");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(
      `   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
    );

    // Listar collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`\n📚 Collections Existentes:`);
    collections.forEach((col) => {
      console.log(`   • ${col.name}`);
    });

    // Verificar se Student collection existe
    const studentCollection = collections.find((c) => c.name === "students");
    if (studentCollection) {
      const studentCount = await mongoose.connection.db
        .collection("students")
        .countDocuments();
      console.log(`\n   └─ Students: ${studentCount} registros`);
    }

    // Verificar se User collection existe
    const userCollection = collections.find((c) => c.name === "users");
    if (userCollection) {
      const userCount = await mongoose.connection.db
        .collection("users")
        .countDocuments();
      console.log(`   └─ Users: ${userCount} registros`);
    }

    console.log("\n✅ Tudo pronto para importar!");
    console.log("\n🚀 Execute agora:");
    console.log("   node bulk-import-students.js\n");

    return true;
  } catch (error) {
    console.error("❌ Erro de conexão:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 Dica: Verifique se o MongoDB está rodando e acessível");
      console.log("   - MongoDB Atlas: Confirme IP whitelist");
      console.log("   - MongoDB Local: Confirme que está ativo");
    }

    if (error.message.includes("authentication failed")) {
      console.log("\n💡 Dica: Verificar credenciais de autenticação");
      console.log("   - Usuario: Correto?");
      console.log("   - Senha: Sem caracteres especiais não escapados?");
    }

    return false;
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado do MongoDB\n");
  }
}

// Executar teste
const success = await testConnection();
process.exit(success ? 0 : 1);
