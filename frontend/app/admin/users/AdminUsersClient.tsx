"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../../lib/api";
import { useAuth } from "../../providers/AuthProvider";

type UserItem = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: "ADMIN" | "PARTICIPANT";
  isActive: boolean;
  createdAt: string;
};

function roleBadge(role: UserItem["role"]) {
  return role === "ADMIN"
    ? { label: "ADMIN", className: "bg-slate-900 text-white" }
    : { label: "PARTICIPANT", className: "bg-slate-100 text-slate-700" };
}

export default function AdminUsersClient() {
  const apiBase = getApiBase();
  const { token, user: currentUser } = useAuth();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchUsers = async (q?: string) => {
    if (!authHeaders) return;
    setError(null);
    setLoading(true);
    try {
      const qs = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`${apiBase}/users${qs}`, { headers: authHeaders });
      if (!res.ok) {
        throw new Error("Impossible de charger les utilisateurs.");
      }
      const data = (await res.json()) as UserItem[];
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authHeaders) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  const toggleRole = async (target: UserItem) => {
    if (!authHeaders) return;
    if (currentUser?.userId === target.id && target.role === "ADMIN") {
      setError("Action interdite: tu ne peux pas retirer ton propre role admin.");
      return;
    }

    setError(null);
    setProcessingId(target.id);
    try {
      const newRole: UserItem["role"] = target.role === "ADMIN" ? "PARTICIPANT" : "ADMIN";
      const res = await fetch(`${apiBase}/users/${target.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        throw new Error("Mise a jour du role impossible.");
      }
      await res.json();
      await fetchUsers(query);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Utilisateurs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Recherche un utilisateur et ajuste son role (ADMIN / PARTICIPANT).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="h-10 w-64 rounded-full border border-slate-200 bg-white px-4 text-sm"
            placeholder="Rechercher (email, nom)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:opacity-60"
            onClick={() => fetchUsers(query)}
            disabled={loading}
          >
            {loading ? "..." : "Rechercher"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-lg shadow-slate-900/5">
          <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-slate-600 shadow-lg shadow-slate-900/5">
          Aucun utilisateur.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => {
            const badge = roleBadge(u.role);
            const busy = processingId === u.id;
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                    {!u.isActive && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        Inactif
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    {u.fullName ? u.fullName : u.email}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
                    onClick={() => toggleRole(u)}
                    disabled={busy}
                    title={u.role === "ADMIN" ? "Retirer le role admin" : "Donner le role admin"}
                  >
                    {busy ? "..." : u.role === "ADMIN" ? "Retirer admin" : "Rendre admin"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

