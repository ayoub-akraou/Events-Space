"use client";

import { useState } from "react";
import { getApiBase } from "../../lib/api";

type RegisterState = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

export default function RegisterClient() {
  const apiBase = getApiBase();
  const [form, setForm] = useState<RegisterState>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof RegisterState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Cet email est déjà utilisé.");
        }
        if (res.status === 400) {
          throw new Error("Données invalides. Vérifie les champs.");
        }
        throw new Error("Impossible de créer le compte.");
      }

      const data = (await res.json()) as { access_token: string };
      window.localStorage.setItem("events-space-token", data.access_token);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
      <h1 className="text-3xl font-semibold text-slate-900">Créer un compte</h1>
      <p className="mt-2 text-sm text-slate-600">
        Rejoins Events Space pour réserver et gérer tes événements.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Nom complet"
          value={form.fullName}
          onChange={(event) => handleChange("fullName", event.target.value)}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Téléphone"
          value={form.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
          placeholder="Email"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
          placeholder="Mot de passe (min 6)"
          type="password"
          value={form.password}
          onChange={(event) => handleChange("password", event.target.value)}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte créé avec succès. Tu es connecté.
        </div>
      )}

      <button
        className="mt-6 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>
    </div>
  );
}
