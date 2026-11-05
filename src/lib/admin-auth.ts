import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { getDatabase, storageAvailable } from "./database";

const derive = promisify(scrypt);
const cookieName = "portfolio_admin";
const sessionSeconds = 12 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function credential() {
  const value = process.env.PORTFOLIO_ADMIN_HASH;
  return value && /^[0-9a-f]{32}:[0-9a-f]{128}$/.test(value) ? value : undefined;
}

export function adminEnabled() {
  return Boolean(credential()) && storageAvailable();
}

function sessionKey(token: string) {
  return hash(`${credential()}:${token}`);
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT 1 FROM admin_sessions WHERE id = ? AND expires > ?",
    args: [sessionKey(token), Date.now()],
  });
  return result.rows.length === 1;
}

export async function startAdminSession(password: string) {
  const configured = credential();
  if (!configured || !storageAvailable() || !password || password.length > 200) return false;

  const db = await getDatabase();
  const requestHeaders = await headers();
  const remoteAddress = process.env.VERCEL ? requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local";
  const client = hash((remoteAddress || "unknown").slice(0, 128));
  const now = Date.now();
  const window = Math.floor(now / (5 * 60 * 1000));
  const { rows } = await db.execute({
    sql: `INSERT INTO login_limits (client, window, attempts) VALUES (?, ?, 1)
      ON CONFLICT(client) DO UPDATE SET window = excluded.window,
      attempts = CASE WHEN login_limits.window = excluded.window THEN login_limits.attempts + 1 ELSE 1 END
      RETURNING attempts`,
    args: [client, window],
  });
  if (Number(rows[0].attempts) > 8) return false;

  const [salt, encoded] = configured.split(":");
  const actual = await derive(password, Buffer.from(salt, "hex"), 64) as Buffer;
  if (!timingSafeEqual(actual, Buffer.from(encoded, "hex"))) return false;

  const token = randomBytes(32).toString("hex");
  await db.batch([
    { sql: "DELETE FROM admin_sessions WHERE expires <= ?", args: [now] },
    { sql: "DELETE FROM login_limits WHERE client = ? OR window < ?", args: [client, window - 1] },
    { sql: "INSERT INTO admin_sessions (id, expires) VALUES (?, ?)", args: [sessionKey(token), now + sessionSeconds * 1000] },
  ], "write");
  (await cookies()).set(cookieName, token, {
    httpOnly: true, sameSite: "strict", path: "/", maxAge: sessionSeconds,
    secure: Boolean(process.env.VERCEL) || requestHeaders.get("x-forwarded-proto") === "https",
  });
  return true;
}

export async function endAdminSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token && adminEnabled() && /^[a-f0-9]{64}$/.test(token)) {
    const db = await getDatabase();
    await db.execute({ sql: "DELETE FROM admin_sessions WHERE id = ?", args: [sessionKey(token)] });
  }
  jar.delete(cookieName);
}
