"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
          throw new Error("Cet email est deja utilise.");
        }
        if (res.status === 400) {
          throw new Error("Donnees invalides. Verifie les champs.");
        }
        throw new Error("Impossible de creer le compte.");
      }

      await res.json();
      setSuccess(true);
      window.setTimeout(() => {
        const email = encodeURIComponent(form.email);
        router.push(`/login?registered=1&email=${email}`);
      }, 700);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
      <h1 className="text-3xl font-semibold text-slate-900">Creer un compte</h1>
      <p className="mt-2 text-sm text-slate-600">
        Rejoins Events Space pour reserver et gerer tes evenements.
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
          placeholder="Telephone"
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
          Compte cree avec succes. Redirection vers la page de connexion...
        </div>
      )}

      <button
        className="mt-6 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creation..." : "Creer mon compte"}
      </button>

      <p className="mt-6 text-sm text-slate-600">
        Deja un compte ?{" "}
        <Link className="font-semibold text-slate-900 underline" href="/login">
          Connexion
        </Link>
      </p>
    </div>
  );
}

