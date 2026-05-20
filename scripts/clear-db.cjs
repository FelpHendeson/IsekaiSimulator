const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  printHelp();
  process.exit(0);
}

loadEnvFile(path.resolve(process.cwd(), ".env"));

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI nao esta configurada no ambiente ou no arquivo .env.");
  process.exit(1);
}

const databaseName = getDatabaseName(uri);

if (!args.has("--yes")) {
  console.log("Este comando vai apagar todos os dados do database MongoDB usado pelo jogo.");
  console.log(`Database alvo: ${databaseName}`);
  console.log("");
  console.log("Para executar de verdade, rode:");
  console.log("  npm run db:clear -- --yes");
  process.exit(0);
}

async function main() {
  await mongoose.connect(uri, {
    bufferCommands: false,
  });

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Conexao MongoDB sem database ativo.");
  }

  await db.dropDatabase();
  await mongoose.disconnect();

  console.log(`Database limpo com sucesso: ${databaseName}`);
}

main().catch(async (error) => {
  await mongoose.disconnect().catch(() => undefined);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    process.env[key] ??= value;
  }
}

function getDatabaseName(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const name = parsed.pathname.replace(/^\//, "");

    return name || "(database padrao da URI)";
  } catch {
    return "(nao foi possivel identificar pela URI)";
  }
}

function printHelp() {
  console.log("Limpa o database MongoDB configurado em MONGODB_URI.");
  console.log("");
  console.log("Uso:");
  console.log("  npm run db:clear");
  console.log("  npm run db:clear -- --yes");
}
