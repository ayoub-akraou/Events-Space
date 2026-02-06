"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-semibold text-slate-900">Connexion requise</h2>
        <p className="mt-2 text-sm text-slate-600">
          Cette zone est reservee aux administrateurs.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
          href={`/login?next=${encodeURIComponent(pathname ?? "/admin")}`}
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-semibold text-slate-900">Acces interdit</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tu n'as pas les droits pour acceder aux pages admin.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
          href="/events"
        >
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

