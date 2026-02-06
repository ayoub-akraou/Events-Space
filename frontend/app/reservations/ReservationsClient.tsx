"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../lib/api";
import type { ReservationItem } from "../../lib/types";
import { useAuth } from "../providers/AuthProvider";

function statusLabel(status: ReservationItem["status"]) {
  switch (status) {
    case "PENDING":
      return { text: "En attente", className: "bg-amber-100 text-amber-700" };
    case "CONFIRMED":
      return { text: "Confirmee", className: "bg-emerald-100 text-emerald-700" };
    case "REFUSED":
      return { text: "Refusee", className: "bg-rose-100 text-rose-700" };
    case "CANCELED":
      return { text: "Annulee", className: "bg-slate-100 text-slate-600" };
    default:
      return { text: status, className: "bg-slate-100 text-slate-600" };
  }
}

export default function ReservationsClient() {
  const apiBase = getApiBase();
  const { token, user, isLoading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => !!token && !!user, [token, user]);

  const fetchReservations = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Impossible de charger les reservations.");
      }
      const data = (await res.json()) as ReservationItem[];
      setReservations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canFetch) {
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch]);

  const cancelReservation = async (reservationId: string) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/reservations/${reservationId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Annulation impossible.");
      }
      await fetchReservations();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const downloadTicket = async (reservationId: string) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/reservations/${reservationId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Ticket indisponible (reservation non confirmee).");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${reservationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (authLoading) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-semibold text-slate-900">Connexion requise</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connecte-toi pour voir tes reservations et telecharger tes tickets.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
          href="/login?next=/reservations"
        >
          Aller a la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Connecte en tant que <span className="font-semibold text-slate-900">{user.email}</span>
        </p>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          onClick={fetchReservations}
          disabled={loading}
        >
          {loading ? "Chargement..." : "Rafraichir"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-slate-600 shadow-xl shadow-slate-900/5">
          Aucune reservation pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const badge = statusLabel(reservation.status);
            return (
              <div
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {reservation.id}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {reservation.event?.title ?? "Evenement"}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.text}
                    </span>
                    {reservation.event?.location?.name && (
                      <span className="text-xs text-slate-500">
                        {reservation.event.location.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => downloadTicket(reservation.id)}
                    disabled={reservation.status !== "CONFIRMED"}
                    title={
                      reservation.status !== "CONFIRMED"
                        ? "Disponible uniquement pour les reservations confirmees"
                        : "Telecharger le ticket"
                    }
                  >
                    Ticket PDF
                  </button>
                  <button
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
                    onClick={() => cancelReservation(reservation.id)}
                    disabled={reservation.status === "CANCELED" || reservation.status === "REFUSED"}
                    title={
                      reservation.status === "CANCELED" || reservation.status === "REFUSED"
                        ? "Action indisponible"
                        : "Annuler la reservation"
                    }
                  >
                    Annuler
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

