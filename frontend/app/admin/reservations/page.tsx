import Link from "next/link";
import AdminGate from "../AdminGate";
import AdminReservationsClient from "./AdminReservationsClient";

export default function AdminReservationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <AdminGate>
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="text-4xl font-semibold text-slate-900">Gestion des reservations</h1>
            <Link
              href="/admin"
              className="text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </header>
        <AdminReservationsClient />
      </AdminGate>
    </div>
  );
}

