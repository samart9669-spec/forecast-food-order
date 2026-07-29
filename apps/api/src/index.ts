import { Hono } from "hono";
import { cors } from "hono/cors";

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
