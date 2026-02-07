"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiBase } from "../../lib/api";
import { useAuth } from "../providers/AuthProvider";

export default function ReserveButton({
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
          throw new Error("Deja reserve ou complet.");
        }
        throw new Error("Impossible de reserver.");
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
        href={`/login?next=/events/${eventId}`}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        title="Connexion requise"
      >
        Reserver
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}
      {success && (
        <p className="text-xs font-medium text-emerald-700">
          Demande envoyee.{" "}
          <Link href="/reservations" className="underline underline-offset-4">
            Voir mes reservations
          </Link>
        </p>
      )}
      <button
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleReserve}
        disabled={loading || disabled || success}
        title={disabled ? "Evenement complet" : "Demander une reservation"}
      >
        {disabled ? "Complet" : loading ? "..." : success ? "Envoyee" : "Reserver"}
      </button>
    </div>
  );
}

