import { cookies } from "next/headers";
import {
  e2eCalculatorsPage,
  e2eEmptyCalculatorsPage,
  e2eCalculationsPage,
} from "@/lib/testing/e2eServerFixtures";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";
const E2E_CALCULATORS_LIST_COOKIE = "E2E_CALCULATORS_LIST";
// Set this cookie to "1" to enable the global E2E fixture bypass for all SSR endpoints.
const E2E_MODE_COOKIE = "E2E_MODE";

export async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const e2eCalculatorsList = cookieStore.get(E2E_CALCULATORS_LIST_COOKIE)?.value;
  const e2eMode = cookieStore.get(E2E_MODE_COOKIE)?.value;

  console.log("SERVER FETCH PATH:", path);
  console.log("SERVER FETCH COOKIES:", cookieStore.getAll().map(c => c.name + "=" + c.value));

  if (process.env.NODE_ENV !== "production") {
    // Check if we have bypass cookies
    if (e2eCalculatorsList || e2eMode) {
      if (path.includes("/api/calculators")) {
        return (e2eCalculatorsList === "empty" ? e2eEmptyCalculatorsPage : e2eCalculatorsPage) as T;
      }
      if (path.includes("/api/calculations")) {
        return e2eCalculationsPage as unknown as T;
      }
    }
  }

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
