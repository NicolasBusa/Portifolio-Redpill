"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { contentSchema, maxCoverBytes } from "@/lib/content";
import { endAdminSession, isAdmin, startAdminSession } from "@/lib/admin-auth";
import { publishPortfolio } from "@/lib/content-store";
import { getDatabase } from "@/lib/database";

export async function signIn(_state: { error: string }, form: FormData) {
  const password = form.get("password");
  if (typeof password !== "string" || !(await startAdminSession(password))) {
    return { error: "Senha inválida ou limite de tentativas atingido. Tente novamente em alguns minutos." };
  }
  redirect("/admin");
}

export async function signOut() {
  await endAdminSession();
  redirect("/admin");
}

export async function saveContent(data: unknown, revision: number) {
  if (!(await isAdmin())) return { error: "Sua sessão expirou. Entre novamente no painel." };
  if (!Number.isSafeInteger(revision) || revision < 0) return { error: "Versão inválida. Reabra o painel." };
  const parsed = contentSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `Revise o conteúdo (${issue.path.join(" › ") || "formulário"}): ${issue.message}` };
  }
  const uploaded = [...new Set(parsed.data.projects
    .map((project) => project.imageUrl)
    .filter((url) => url.startsWith("/media/"))
    .map((url) => url.slice("/media/".length)))];
  if (uploaded.length) {
    const db = await getDatabase();
    const { rows } = await db.execute({
      sql: `SELECT id FROM covers WHERE id IN (${uploaded.map(() => "?").join(",")})`,
      args: uploaded,
    });
    if (rows.length !== uploaded.length) return { error: "Uma das capas não está disponível. Envie a imagem novamente." };
  }
  if (!(await publishPortfolio(parsed.data, revision))) {
    return { error: "O conteúdo foi alterado em outra aba. Preserve suas alterações e recarregue antes de publicar." };
  }
  return { revision: revision + 1, content: parsed.data };
}

function imageMime(bytes: Buffer) {
  if (bytes.length < 16) return;
  if (bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) return "image/png";
  if (bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"))) return "image/jpeg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
}

export async function uploadCover(form: FormData) {
  if (!(await isAdmin())) return { error: "Sua sessão expirou. Entre novamente no painel." };
  const file = form.get("cover");
  if (!(file instanceof File) || file.size === 0 || file.size > maxCoverBytes) {
    return { error: "Selecione uma imagem de até 2 MB." };
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = imageMime(bytes);
  if (!mime) return { error: "Formato inválido. Use uma imagem JPG, PNG ou WebP." };
  const id = createHash("sha256").update(bytes).digest("hex");
  const db = await getDatabase();
  await db.execute({
    sql: "INSERT INTO covers (id, mime, bytes) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING",
    args: [id, mime, bytes],
  });
  return { url: `/media/${id}` };
}
