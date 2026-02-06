const DEFAULT_API_BASE = "http://localhost:3000";

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
