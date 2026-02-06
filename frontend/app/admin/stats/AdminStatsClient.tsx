"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../../lib/api";
import { useAuth } from "../../providers/AuthProvider";

type Overview = {
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  canceledReservations: number;
};

type OccupancyItem = {
  eventId: string;
  title: string;
  capacityMax: number;
  confirmed: number;
  fillRate: number;
  startAt: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminStatsClient() {
  const apiBase = getApiBase();
  const { token } = useAuth();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchStats = async () => {
    if (!authHeaders) return;
    setError(null);
    setLoading(true);
    try {
      const [overviewRes, occupancyRes] = await Promise.all([
        fetch(`${apiBase}/stats/overview`, { headers: authHeaders }),
        fetch(`${apiBase}/stats/occupancy`, { headers: authHeaders }),
      ]);
      if (!overviewRes.ok) {
        throw new Error("Impossible de charger les indicateurs.");
      }
      if (!occupancyRes.ok) {
        throw new Error("Impossible de charger le taux de remplissage.");
      }
      const overviewData = (await overviewRes.json()) as Overview;
      const occupancyData = (await occupancyRes.json()) as OccupancyItem[];
      setOverview(overviewData);
      setOccupancy(occupancyData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authHeaders) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Indicateurs</h2>
          <p className="mt-1 text-sm text-slate-600">Suivi global et taux de remplissage.</p>
        </div>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          onClick={fetchStats}
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

      {!overview ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-lg shadow-slate-900/5">
          <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { label: "Evenements totaux", value: overview.totalEvents },
            { label: "Evenements publies", value: overview.publishedEvents },
            { label: "Evenements a venir", value: overview.upcomingEvents },
            { label: "Reservations totales", value: overview.totalReservations },
            { label: "Confirmations", value: overview.confirmedReservations },
            { label: "En attente", value: overview.pendingReservations },
            { label: "Annulations", value: overview.canceledReservations },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Taux de remplissage</h3>
          <p className="text-sm text-slate-600">Base sur les reservations confirmees.</p>
        </div>
        {occupancy.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">Aucun evenement publie.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {occupancy.map((item) => {
              const percentage = Math.round((item.fillRate ?? 0) * 100);
              return (
                <div key={item.eventId} className="rounded-2xl bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(item.startAt)}</p>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <p>
                        {item.confirmed} / {item.capacityMax}
                      </p>
                      <p className="font-semibold text-slate-900">{percentage}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

