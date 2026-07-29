export type DashboardSession = { id: string; started_at: string; ended_at: string; duration_seconds: number; device: string | null; status: string };

type D1Result<T> = { results?: T[] };

export async function getSession(db: D1Database, sessionId: string): Promise<DashboardSession | null> {
  return await db.prepare("SELECT session_id AS id,started_at,ended_at,duration_seconds,device,status FROM night_summary WHERE session_id=?1").bind(sessionId).first<DashboardSession>();
}

export async function listSessions(db: D1Database): Promise<DashboardSession[]> {
  const rows = await db.prepare("SELECT session_id AS id,started_at,ended_at,duration_seconds,device,status FROM night_summary ORDER BY started_at DESC LIMIT 90").all<DashboardSession>() as D1Result<DashboardSession>;
  return rows.results ?? [];
}
