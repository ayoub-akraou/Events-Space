import Link from "next/link";
import AdminGate from "./AdminGate";

const quickActions = [
  { href: "/admin/events", title: "Gerer les evenements", desc: "Creer, publier ou annuler." },
  {
    href: "/admin/reservations",
    title: "Gerer les reservations",
    desc: "Confirmer ou refuser les demandes.",
  },
  { href: "/admin/stats", title: "Voir les indicateurs", desc: "Suivre la participation globale." },
  { href: "/admin/users", title: "Roles utilisateurs", desc: "Donner/retirer le role admin." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <AdminGate>
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
          <h1 className="text-4xl font-semibold text-slate-900">Tableau de bord</h1>
          <p className="mt-3 text-base text-slate-600">
            Accede rapidement aux actions principales.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5"
            >
              <h2 className="text-xl font-semibold text-slate-900">{action.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{action.desc}</p>
              <span className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Ouvrir
              </span>
            </Link>
          ))}
        </div>
      </AdminGate>
    </div>
  );
}
