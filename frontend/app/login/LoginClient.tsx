"use client";

import { useState } from "react";
import { getApiBase } from "../../lib/api";

type LoginState = {
  email: string;
  password: string;
};

export default function LoginClient() {
  const apiBase = getApiBase();
  const [form, setForm] = useState<LoginState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof LoginState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Identifiants invalides.");
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
      <h1 className="text-3xl font-semibold text-slate-900">Connexion</h1>
      <p className="mt-2 text-sm text-slate-600">Connecte-toi pour accéder à tes réservations.</p>

      <div className="mt-6 grid gap-4">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Email"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="Mot de passe"
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
          Connexion réussie.
        </div>
      )}

      <button
        className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </div>
  );
}
