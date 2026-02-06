"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiBase } from "../../../lib/api";
import { useAuth } from "../../providers/AuthProvider";

export default function ReserveAction({
  eventId,
  disabled,
}: {
  eventId: string;
  disabled?: boolean;
}) {
  const apiBase = getApiBase();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReserve = async () => {
    if (!token) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Reservation deja existante ou capacite atteinte.");
        }
        throw new Error("Impossible de creer la reservation.");
      }

      await res.json();
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
        href={`/login?next=/events/${eventId}`}
      >
        Se connecter pour reserver
      </Link>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Demande envoyee. Tu peux suivre le statut dans{" "}
          <Link href="/reservations" className="font-semibold underline">
            mes reservations
          </Link>
          .
        </div>
      )}

      <button
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleReserve}
        disabled={loading || disabled}
      >
        {loading ? "Envoi..." : "Demander une reservation"}
      </button>
    </div>
  );
}

