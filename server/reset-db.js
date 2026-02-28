import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    const db = mongoose.connection.db;

    // Listar e dropar todas as coleções
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Dropando ${collections.length} coleções...`);

    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`  ✓ ${collection.name} deletada`);
    }

    console.log("\n✅ Banco de dados limpo com sucesso!");
    console.log(
      '💡 Execute: Invoke-RestMethod -Uri "http://localhost:3001/api/setup/init" -Method POST -ContentType "application/json"',
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
};

resetDatabase();
