import { isAdmin } from "@/lib/admin-auth";
import { loadPortfolio } from "@/lib/content-store";
import { getDatabase, storageAvailable } from "@/lib/database";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{64}$/.test(id) || !storageAvailable()) return new Response(null, { status: 404 });
  const { content } = await loadPortfolio();
  const published = content.projects.some((project) => project.imageUrl === `/media/${id}`);
  if (!published && !(await isAdmin())) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  const db = await getDatabase();
  const { rows } = await db.execute({ sql: "SELECT mime, bytes FROM covers WHERE id = ?", args: [id] });
  const image = rows[0];
  if (!image) return new Response(null, { status: 404 });
  const body = image.bytes instanceof Uint8Array ? Uint8Array.from(image.bytes) : image.bytes;
  if (!(body instanceof ArrayBuffer) && !(body instanceof Uint8Array)) return new Response(null, { status: 404 });
  return new Response(body, {
    headers: {
      "Content-Type": String(image.mime),
      "Content-Length": String(body.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": published ? "public, max-age=3600" : "private, no-store",
    },
  });
}
