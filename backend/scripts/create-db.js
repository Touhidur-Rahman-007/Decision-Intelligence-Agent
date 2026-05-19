const fs = require("fs");
const path = require("path");
const { DataSource } = require("typeorm");

const envPath = path.join(__dirname, "..", ".env");
const logPath = path.join(__dirname, "create-db.log");
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const env = {};

for (const raw of envText.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx < 0) continue;
  const key = line.slice(0, idx).trim();
  const val = line.slice(idx + 1).trim();
  env[key] = val;
}

const host = env.DATABASE_HOST || "localhost";
const port = Number(env.DATABASE_PORT || 5432);
const user = env.DATABASE_USER || "postgres";
const password = env.DATABASE_PASSWORD || "";
const targetDb = env.DATABASE_NAME || "dia";

function writeLog(message) {
  fs.appendFileSync(logPath, message + "\n", "utf8");
}

if (!/^[A-Za-z0-9_]+$/.test(targetDb)) {
  console.error("Invalid DATABASE_NAME. Use only letters, numbers, underscore.");
  writeLog("Invalid DATABASE_NAME. Use only letters, numbers, underscore.");
  process.exit(1);
}

console.log("DB bootstrap: connecting to postgres to ensure database exists...");
writeLog("DB bootstrap: connecting to postgres to ensure database exists...");

const adminDataSource = new DataSource({
  type: "postgres",
  host,
  port,
  username: user,
  password,
  database: "postgres",
});

async function run() {
  await adminDataSource.initialize();
  const exists = await adminDataSource.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [targetDb]
  );
  if (exists.length === 0) {
    await adminDataSource.query("CREATE DATABASE \"" + targetDb + "\"");
    console.log("Created database:", targetDb);
    writeLog("Created database: " + targetDb);
  } else {
    console.log("Database already exists:", targetDb);
    writeLog("Database already exists: " + targetDb);
  }
  await adminDataSource.destroy();
}

run().catch((err) => {
  console.error("DB bootstrap failed:", err.message);
  writeLog("DB bootstrap failed: " + err.message);
  process.exit(1);
});
