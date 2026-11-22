const { Pool } = require("pg");
require("dotenv").config();

const useDatabaseUrl = Boolean(process.env.DATABASE_URL);
const pool = new Pool(useDatabaseUrl ? {
  connectionString: process.env.DATABASE_URL,
  // Render PostgreSQL connections use TLS. Local DATABASE_URL users can override this if needed.
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
} : {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "queueless_canteen",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => console.error("Unexpected PostgreSQL error:", err));
module.exports = pool;
