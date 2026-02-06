"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../../lib/api";
import type { EventItem, ReservationItem } from "../../../lib/types";
import { useAuth } from "../../providers/AuthProvider";

type AdminUser = {
  id: string;
  email: string;
  fullName?: string | null;
};

type AdminReservationItem = ReservationItem & {
  user: AdminUser;
  event: EventItem;
  adminNote?: string | null;
};

type StatusFilter = ReservationItem["status"] | "ALL";

function statusBadge(status: ReservationItem["status"]) {
  switch (status) {
    case "PENDING":
      return { label: "En attente", className: "bg-amber-100 text-amber-700" };
    case "CONFIRMED":
      return { label: "Confirmee", className: "bg-emerald-100 text-emerald-700" };
    case "REFUSED":
      return { label: "Refusee", className: "bg-rose-100 text-rose-700" };
    case "CANCELED":
      return { label: "Annulee", className: "bg-slate-100 text-slate-600" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-600" };
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const filters: Array<{ key: StatusFilter; label: string }> = [
  { key: "PENDING", label: "En attente" },
  { key: "CONFIRMED", label: "Confirmees" },
  { key: "REFUSED", label: "Refusees" },
  { key: "CANCELED", label: "Annulees" },
  { key: "ALL", label: "Toutes" },
];

export default function AdminReservationsClient() {
  const apiBase = getApiBase();
  const { token } = useAuth();

  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [reservations, setReservations] = useState<AdminReservationItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<{ id: string; action: "confirm" | "refuse" } | null>(
    null,
  );

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchReservations = async () => {
    if (!authHeaders) return;
    setError(null);
    setLoading(true);
    try {
      const query = filter === "ALL" ? "" : `?status=${encodeURIComponent(filter)}`;
      const res = await fetch(`${apiBase}/reservations${query}`, {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Impossible de charger les reservations.");
      }
      const data = (await res.json()) as AdminReservationItem[];
      setReservations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authHeaders) return;
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders, filter]);

  const decide = async (id: string, action: "confirm" | "refuse") => {
    if (!authHeaders) return;
    setError(null);
    setProcessing({ id, action });
    try {
      const adminNote = notes[id]?.trim() || undefined;
      const res = await fetch(`${apiBase}/reservations/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ adminNote }),
      });
      if (!res.ok) {
        throw new Error(action === "confirm" ? "Confirmation impossible." : "Refus impossible.");
      }
      await res.json();
      await fetchReservations();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Reservations</h2>
          <p className="mt-1 text-sm text-slate-600">
            Confirme ou refuse les demandes (statut: en attente).
          </p>
        </div>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          onClick={fetchReservations}
          disabled={loading}
        >
          {loading ? "Chargement..." : "Rafraichir"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700 hover:border-slate-400"
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-lg shadow-slate-900/5">
          <div className="h-5 w-60 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-slate-600 shadow-lg shadow-slate-900/5">
          Aucune reservation pour ce filtre.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const badge = statusBadge(reservation.status);
            const isPending = reservation.status === "PENDING";
            const isBusy = processing?.id === reservation.id;
            return (
              <div
                key={reservation.id}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatDateTime(reservation.requestedAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                      {reservation.event?.title ?? "Evenement"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {reservation.user.fullName ? reservation.user.fullName : reservation.user.email}
                      {" · "}
                      <span className="text-slate-500">{reservation.user.email}</span>
                    </p>
                    {reservation.event?.location?.name && (
                      <p className="mt-1 text-xs text-slate-500">{reservation.event.location.name}</p>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex flex-col gap-3 md:min-w-[280px]">
                      <input
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                        placeholder="Note admin (optionnel)"
                        value={notes[reservation.id] ?? ""}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [reservation.id]: e.target.value }))
                        }
                        disabled={isBusy}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
                          onClick={() => decide(reservation.id, "refuse")}
                          disabled={isBusy}
                        >
                          {isBusy && processing?.action === "refuse" ? "..." : "Refuser"}
                        </button>
                        <button
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:opacity-60"
                          onClick={() => decide(reservation.id, "confirm")}
                          disabled={isBusy}
                        >
                          {isBusy && processing?.action === "confirm" ? "..." : "Confirmer"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      {reservation.adminNote ? (
                        <>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Note</p>
                          <p className="mt-1">{reservation.adminNote}</p>
                        </>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

