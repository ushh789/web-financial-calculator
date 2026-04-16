import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND}${path}`, {
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}
