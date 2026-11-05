import "server-only";
import { createClient } from "@libsql/client/http";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

type Argument = string | number | Buffer;
type Statement = string | { sql: string; args: Argument[] };
type Value = string | number | bigint | null | ArrayBuffer | Uint8Array;
type Result = { rows: Record<string, Value>[]; rowsAffected: number };

interface Database {
  execute(statement: Statement): Promise<Result>;
  batch(statements: Statement[], mode: "write"): Promise<unknown>;
  close(): void;
}

export function storageAvailable() {
  return process.env.TURSO_DATABASE_URL
    ? Boolean(process.env.TURSO_AUTH_TOKEN)
    : !process.env.VERCEL;
}

async function localDatabase(): Promise<Database> {
  const directory = resolve(/* turbopackIgnore: true */ process.env.PORTFOLIO_DATA_DIR || ".portfolio-data");
  await mkdir(/* turbopackIgnore: true */ directory, { recursive: true });
  const db = new DatabaseSync(join(directory, "portfolio.db"));
  db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
  function execute(statement: Statement): Result {
    const { sql, args } = typeof statement === "string" ? { sql: statement, args: [] } : statement;
    const query = db.prepare(sql);
    if (query.columns().length) return { rows: query.all(...args), rowsAffected: 0 };
    return { rows: [], rowsAffected: Number(query.run(...args).changes) };
  }
  return {
    async execute(statement) { return execute(statement); },
    async batch(statements) {
      db.exec("BEGIN IMMEDIATE");
      try {
        for (const statement of statements) execute(statement);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    close() { db.close(); },
  };
}

async function initialize() {
  if (!storageAvailable()) throw new Error("Armazenamento do portfólio indisponível.");
  const url = process.env.TURSO_DATABASE_URL;
  const db: Database = url
    ? createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    : await localDatabase();
  try {
    await db.batch([
      "CREATE TABLE IF NOT EXISTS portfolio (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL, body TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS covers (id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes BLOB NOT NULL)",
      "CREATE TABLE IF NOT EXISTS admin_sessions (id TEXT PRIMARY KEY, expires INTEGER NOT NULL)",
      "CREATE TABLE IF NOT EXISTS login_limits (client TEXT PRIMARY KEY, window INTEGER NOT NULL, attempts INTEGER NOT NULL)",
    ], "write");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

let database: ReturnType<typeof initialize> | undefined;
export function getDatabase() {
  database ??= initialize().catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}
