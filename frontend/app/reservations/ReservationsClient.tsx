"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReservationItem } from "../../lib/types";
import { getApiBase } from "../../lib/api";

type LoginState = {
  email: string;
  password: string;
};

export default function ReservationsClient() {
  const apiBase = getApiBase();
  const [token, setToken] = useState("");
  const [login, setLogin] = useState<LoginState>({ email: "", password: "" });
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("events-space-token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  const isAuthenticated = useMemo(() => token.length > 10, [token]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      if (!res.ok) {
        throw new Error("Identifiants invalides");
      }
      const data = (await res.json()) as { access_token: string };
      setToken(data.access_token);
      window.localStorage.setItem("events-space-token", data.access_token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Impossible de charger les réservations");
      }
      const data = (await res.json()) as ReservationItem[];
      setReservations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (reservationId: string) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/reservations/${reservationId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Ticket indisponible");
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

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
          <h2 className="text-xl font-semibold text-slate-900">Connexion</h2>
          <p className="mt-2 text-sm text-slate-600">
            Connecte-toi pour récupérer tes réservations.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
              placeholder="Email"
              value={login.email}
              onChange={(event) => setLogin({ ...login, email: event.target.value })}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
              placeholder="Mot de passe"
              type="password"
              value={login.password}
              onChange={(event) => setLogin({ ...login, password: event.target.value })}
            />
          </div>
          <button
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Token: {isAuthenticated ? "chargé" : "absent"}</p>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          onClick={fetchReservations}
          disabled={!isAuthenticated || loading}
        >
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-slate-600 shadow-lg shadow-slate-900/5">
            Aucune réservation à afficher.
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {reservation.id}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {reservation.event?.title ?? "Événement"}
                </h2>
                <p className="text-sm text-slate-600">{reservation.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => downloadTicket(reservation.id)}
                >
                  Télécharger le ticket
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
