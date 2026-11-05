import "server-only";
import { cache } from "react";
import { contentSchema, type Content, type Snapshot } from "./content";
import { defaultContent } from "./default-content";
import { getDatabase, storageAvailable } from "./database";

export const loadPortfolio = cache(async (): Promise<Snapshot> => {
  if (!storageAvailable()) return { revision: 0, content: defaultContent };
  const db = await getDatabase();
  const { rows } = await db.execute("SELECT revision, body FROM portfolio WHERE id = 1");
  const row = rows[0];
  if (!row) return { revision: 0, content: defaultContent };
  return { revision: Number(row.revision), content: contentSchema.parse(JSON.parse(String(row.body))) };
});

export async function publishPortfolio(content: Content, revision: number) {
  const db = await getDatabase();
  const body = JSON.stringify(content);
  const result = await db.execute(revision === 0
    ? { sql: "INSERT INTO portfolio (id, revision, body) VALUES (1, 1, ?) ON CONFLICT(id) DO NOTHING", args: [body] }
    : { sql: "UPDATE portfolio SET body = ?, revision = revision + 1 WHERE id = 1 AND revision = ?", args: [body, revision] });
  return result.rowsAffected === 1;
}
