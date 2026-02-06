"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";

type LoginState = {
  email: string;
  password: string;
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const registered = searchParams.get("registered") === "1";
  const prefillEmail = searchParams.get("email") ?? "";

  const { user, isLoading: authLoading, login } = useAuth();
  const next = nextParam ?? (user?.role === "ADMIN" ? "/admin" : "/events");
  const [form, setForm] = useState<LoginState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillEmail && !form.email) {
      setForm((prev) => ({ ...prev, email: prefillEmail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillEmail]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(next);
    }
  }, [authLoading, user, next, router]);

  const handleChange = (field: keyof LoginState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (!res.ok) {
        throw new Error(res.message);
      }
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
      <h1 className="text-3xl font-semibold text-slate-900">Connexion</h1>
      <p className="mt-2 text-sm text-slate-600">Connecte-toi pour acceder a tes reservations.</p>

      {registered && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte cree avec succes. Connecte-toi maintenant.
        </div>
      )}

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

      <button
        className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
        onClick={handleSubmit}
        disabled={loading || authLoading}
      >
        {loading || authLoading ? "Connexion..." : "Se connecter"}
      </button>

      <p className="mt-6 text-sm text-slate-600">
        Pas de compte ?{" "}
        <Link className="font-semibold text-slate-900 underline" href="/register">
          Creer un compte
        </Link>
      </p>
    </div>
  );
}
