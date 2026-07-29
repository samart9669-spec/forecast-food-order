import { Hono } from "hono";
import { cors } from "hono/cors";
import { listSessions, getSession } from "./lib/dashboard";

type Bindings = {
  DB: D1Database;
  SLEEP_UPLOADS: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true, service: "sleephq-clone-api" }));

app.get("/api/dashboard", async (c) => {
  const sessions = await listSessions(c.env.DB);
  return c.json({ sessions });
});

app.get("/api/dashboard/:session", async (c) => {
  const sessionId = c.req.param("session");
  const session = await getSession(c.env.DB, sessionId);
  const statistics = await c.env.DB.prepare("SELECT * FROM statistics WHERE session_id=?1").bind(sessionId).first();
  return c.json({ session, statistics });
});

app.get("/api/events/:session", async (c) => {
  const rows = await c.env.DB.prepare("SELECT id,type,start_seconds,duration_seconds,source FROM events WHERE session_id=?1 ORDER BY start_seconds").bind(c.req.param("session")).all();
  return c.json({ events: rows.results });
});

app.get("/api/statistics/:session", async (c) => {
  const statistics = await c.env.DB.prepare("SELECT * FROM statistics WHERE session_id=?1").bind(c.req.param("session")).first();
  return c.json({ statistics });
});

app.get("/api/signals/:session", async (c) => {
  const sessionId = c.req.param("session");
  const signal = c.req.query("signal");
  const start = Number.parseFloat(c.req.query("start") ?? "0") || 0;
  const end = Number.parseFloat(c.req.query("end") ?? "86400") || 86400;
  const maxPoints = Math.min(5000, Number.parseInt(c.req.query("maxPoints") ?? "1200", 10) || 1200);
  let query = "SELECT signal_name,sample_rate,start_seconds,end_seconds,r2_key FROM signal_cache WHERE session_id=?1 AND end_seconds>=?2 AND start_seconds<=?3";
  const bindings: Array<string | number> = [sessionId, start, end];
  if (signal) { query += " AND signal_name=?4"; bindings.push(signal); }
  const rows = await c.env.DB.prepare(query).bind(...bindings).all();
  return c.json({ sessionId, window: { start, end, maxPoints }, signals: rows.results });
});

app.get("/api/uploads", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,path,original_name,size,content_type,r2_key,uploaded_at FROM uploads ORDER BY uploaded_at DESC LIMIT 100",
  ).all();

  return c.json({ uploads: rows.results });
});

app.post("/api/uploads", async (c) => {
  try {
    const form = await c.req.formData();
    const file = form.get("file");
    const pathValue = form.get("path");

    if (!(file instanceof File)) {
      return c.text("Missing file field", 400);
    }

    const relativePath = typeof pathValue === "string" && pathValue.length > 0 ? pathValue : file.name;
    const id = crypto.randomUUID();
    const safePath = relativePath.replace(/^\/+/, "").replace(/\.\./g, "_");
    const key = `imports/${id}/${safePath}`;

    await c.env.SLEEP_UPLOADS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
      customMetadata: { originalName: file.name, relativePath: safePath },
    });

    await c.env.DB.prepare(
      "INSERT INTO uploads (id,path,original_name,content_type,size,r2_key) VALUES (?1,?2,?3,?4,?5,?6)",
    )
      .bind(id, safePath, file.name, file.type || "application/octet-stream", file.size, key)
      .run();

    return c.json({ id, path: safePath, key, size: file.size }, 201);
  } catch (error) {
    console.error(error);
    return c.text(error instanceof Error ? error.message : "Upload failed", 500);
  }
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
