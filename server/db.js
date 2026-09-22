import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env and root .env
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const connectionString = (process.env.DATABASE_URL || "").trim();

let pool;

if (connectionString.includes("neon.tech")) {
  // Use Neon serverless driver with WebSockets for 100% reliable TLS on port 443
  const { Pool, neonConfig } = await import("@neondatabase/serverless");
  const ws = (await import("ws")).default;
  neonConfig.webSocketConstructor = ws;

  pool = new Pool({
    connectionString,
  });
} else {
  // Standard PostgreSQL connection for local or self-hosted DB
  const { Pool } = pg;
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });
}

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

export default pool;